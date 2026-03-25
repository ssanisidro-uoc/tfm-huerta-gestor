import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CalendarTasksFinder } from '../../../../Contexts/Task/application/GetCalendarTasks/CalendarTasksFinder';
import { UserGardenRepository } from '../../../../Contexts/Garden/infrastructure/persistence/UserGardenRepository';

export class GetCalendarTasksController {
  constructor(
    private calendarFinder: CalendarTasksFinder,
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

      const tasks = await this.calendarFinder.run(
        garden_id,
        new Date(start_date as string),
        new Date(end_date as string),
        filters
      );

      const tasksByDate: Record<string, any[]> = {};
      for (const task of tasks) {
        const dateKey = new Date(task.scheduled_date).toISOString().split('T')[0];
        if (!tasksByDate[dateKey]) {
          tasksByDate[dateKey] = [];
        }
        tasksByDate[dateKey].push({
          id: task.id.get_value(),
          task_type: task.task_type,
          task_category: task.task_category,
          title: task.title.get_value(),
          description: task.description,
          scheduled_date: task.scheduled_date,
          plot_id: task.plot_id,
          planting_id: task.planting_id,
          status: task.status,
          priority: task.priority,
          is_recurring: task.is_recurring
        });
      }

      logger.info(`Calendar tasks: ${tasks.length} tasks from ${start_date} to ${end_date}`, 'GetCalendarTasksController');

      res.status(200).json({
        success: true,
        data: {
          tasks: tasksByDate,
          total: tasks.length
        }
      });
    } catch (error: unknown) {
      logger.error('Error getting calendar tasks', error as Error, 'GetCalendarTasksController');
      next(error);
    }
  }
}
