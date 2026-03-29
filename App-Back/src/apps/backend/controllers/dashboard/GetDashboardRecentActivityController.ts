import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { GetDashboardRecentActivityQuery } from '../../../../Contexts/Dashboard/application/RecentActivity/GetDashboardRecentActivityQuery';
import { DashboardRecentActivityResponse } from '../../../../Contexts/Dashboard/application/RecentActivity/DashboardRecentActivityFinder';

export class GetDashboardRecentActivityController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      const query = new GetDashboardRecentActivityQuery(user.userId);
      const result = await this.queryBus.ask(query) as DashboardRecentActivityResponse;

      logger.info(`Dashboard recent activity for user ${user.userId}`, 'GetDashboardRecentActivityController');

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error(`Error fetching dashboard activity: ${error.message}`, 'GetDashboardRecentActivityController');
      next(error);
    }
  }
}
