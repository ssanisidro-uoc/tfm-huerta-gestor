import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { GetDashboardPlotsSummaryQuery } from '../../../../Contexts/Dashboard/application/PlotsSummary/GetDashboardPlotsSummaryQuery';
import { DashboardPlotsSummaryResponse } from '../../../../Contexts/Dashboard/application/PlotsSummary/DashboardPlotsSummaryFinder';

export class GetDashboardPlotsSummaryController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      const query = new GetDashboardPlotsSummaryQuery(user.userId);
      const result = await this.queryBus.ask(query) as DashboardPlotsSummaryResponse;

      logger.info(`Dashboard plots summary for user ${user.userId}`, 'GetDashboardPlotsSummaryController');

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error(`Error fetching dashboard plots: ${error.message}`, 'GetDashboardPlotsSummaryController');
      next(error);
    }
  }
}
