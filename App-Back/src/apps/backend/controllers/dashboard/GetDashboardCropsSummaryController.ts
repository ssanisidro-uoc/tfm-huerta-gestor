import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { GetDashboardCropsSummaryQuery } from '../../../../Contexts/Dashboard/application/CropsSummary/GetDashboardCropsSummaryQuery';
import { DashboardCropsSummaryResponse } from '../../../../Contexts/Dashboard/application/CropsSummary/DashboardCropsSummaryFinder';

export class GetDashboardCropsSummaryController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      const query = new GetDashboardCropsSummaryQuery(user.userId);
      const result = await this.queryBus.ask(query) as DashboardCropsSummaryResponse;

      logger.info(`Dashboard crops summary for user ${user.userId}`, 'GetDashboardCropsSummaryController');

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error(`Error fetching dashboard crops: ${error.message}`, 'GetDashboardCropsSummaryController');
      next(error);
    }
  }
}
