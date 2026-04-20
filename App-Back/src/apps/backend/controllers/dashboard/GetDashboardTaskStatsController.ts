import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { GetTaskStatsQuery } from '../../../../Contexts/Dashboard/application/TaskStats/GetTaskStatsQuery';
import { TaskStatsResponse } from '../../../../Contexts/Dashboard/application/TaskStats/TaskStatsFinder';

export class GetDashboardTaskStatsController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      const query = new GetTaskStatsQuery(user.userId);
      const result = await this.queryBus.ask(query) as TaskStatsResponse;

      logger.info(`Task stats for user ${user.userId}`, 'GetDashboardTaskStatsController');

      res.status(200).json({
        success: true,
        data: {
          stats: result.stats
        }
      });
    } catch (error: any) {
      logger.error(`Error fetching task stats: ${error.message}`, 'GetDashboardTaskStatsController');
      next(error);
    }
  }
}