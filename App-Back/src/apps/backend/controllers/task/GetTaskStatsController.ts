import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { TaskStatsQuery } from '../../../../Contexts/Task/application/TaskStats/TaskStatsQuery';
import { TaskStatsResponse } from '../../../../Contexts/Task/application/TaskStats/TaskStatsFinder';

export class GetTaskStatsController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      const query = new TaskStatsQuery(user.userId);
      const result = await this.queryBus.ask(query) as TaskStatsResponse;

      logger.info(`Task stats for user ${user.userId}`, 'GetTaskStatsController');

      res.status(200).json(result);
    } catch (error: any) {
      logger.error(`Error fetching task stats: ${error.message}`, 'GetTaskStatsController');
      next(error);
    }
  }
}
