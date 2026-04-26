import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { GetAllCalendarTasksQuery } from '../../../../Contexts/Task/application/GetAllCalendarTasks/GetAllCalendarTasksQuery';
import { GetAllCalendarTasksResponse } from '../../../../Contexts/Task/application/GetAllCalendarTasks/GetAllCalendarTasksResponse';

export class GetAllCalendarTasksController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      
      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      const { start_date, end_date, garden_id, plot_id, planting_id, status, task_type, crop_id } = req.query;

      if (!start_date || !end_date) {
        throw new AppError(400, 'VALIDATION_ERROR', 'start_date and end_date are required');
      }

      const query = new GetAllCalendarTasksQuery(
        user.userId,
        new Date(start_date as string),
        new Date(end_date as string),
        {
          status: status as string,
          task_type: task_type as string,
          garden_id: garden_id as string,
          plot_id: plot_id as string,
          planting_id: planting_id as string,
          crop_id: crop_id as string
        }
      );

      const result = await this.queryBus.ask(query) as GetAllCalendarTasksResponse;

      logger.info(`Fetched ${result.tasks.length} calendar tasks for user ${user.userId}`, 'GetAllCalendarTasksController');

      res.status(200).json({
        success: true,
        tasks: result.tasks
      });
    } catch (error: any) {
      logger.error(`Error fetching calendar tasks: ${error.message}`, 'GetAllCalendarTasksController');
      next(error);
    }
  }
}