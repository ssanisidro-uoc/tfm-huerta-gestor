import { NextFunction, Request, Response } from 'express';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { GetDashboardAlertsQuery } from '../../../../Contexts/Dashboard/application/Alerts/GetDashboardAlertsQuery';
import { DashboardAlertsResponse } from '../../../../Contexts/Dashboard/application/Alerts/DashboardAlertsResponse';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class GetDashboardAlertsController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ success: false, error: 'AUTH_UNAUTHORIZED' });
        return;
      }

      const query = new GetDashboardAlertsQuery(user.userId);
      const result = await this.queryBus.ask(query) as DashboardAlertsResponse;

      logger.info(`Dashboard alerts for user ${user.userId}: ${result.alerts.length} alerts`, 'GetDashboardAlertsController');

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error(`Error fetching alerts: ${error.message}`, 'GetDashboardAlertsController');
      next(error);
    }
  }
}