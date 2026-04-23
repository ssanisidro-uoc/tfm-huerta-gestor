import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { UserGardenRepository } from '../../../../Contexts/Garden/infrastructure/persistence/UserGardenRepository';
import { GetCalendarTasksQuery } from '../../../../Contexts/Task/application/GetCalendarTasks/GetCalendarTasksQuery';
import { GetCalendarTasksResponse } from '../../../../Contexts/Task/application/GetCalendarTasks/GetCalendarTasksResponse';

export class GetCalendarTasksController {
  constructor(
    private queryBus: QueryBus,
    private userGardenRepository: UserGardenRepository
  ) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { garden_id } = req.params;
      const { start_date, end_date, task_type, status } = req.query;

      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!garden_id) {
        res.status(400).json({ error: 'garden_id is required' });
        return;
      }

      if (!start_date || !end_date) {
        res.status(400).json({ error: 'start_date and end_date are required' });
        return;
      }

      const hasAccess = await this.userGardenRepository.has_permission(user.userId, garden_id, 'viewer');
      if (!hasAccess) {
        const garden = await this.userGardenRepository.find_by_user_and_garden(user.userId, garden_id);
        if (!garden) {
          res.status(403).json({ error: 'You do not have access to this garden' });
          return;
        }
      }

      const filters: any = {};
      if (task_type) filters.task_type = task_type;
      if (status) filters.status = status;

      const query = new GetCalendarTasksQuery(
        garden_id,
        new Date(start_date as string),
        new Date(end_date as string),
        filters
      );
      
      const result = await this.queryBus.ask(query) as GetCalendarTasksResponse;

      const tasksByDate: Record<string, any[]> = {};
      for (const task of result.tasks) {
        const dateKey = new Date(task.scheduled_date).toISOString().split('T')[0];
        if (!tasksByDate[dateKey]) {
          tasksByDate[dateKey] = [];
        }
        tasksByDate[dateKey].push(task);
      }

      logger.info(`Calendar tasks: ${result.tasks.length} tasks from ${start_date} to ${end_date}`, 'GetCalendarTasksController');

      res.status(200).json({
        success: true,
        data: {
          tasks: tasksByDate,
          total: result.tasks.length
        }
      });
    } catch (error: unknown) {
      logger.error('Error getting calendar tasks', error as Error, 'GetCalendarTasksController');
      next(error);
    }
  }
}
