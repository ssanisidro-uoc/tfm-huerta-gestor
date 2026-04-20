import { NextFunction, Request, Response } from 'express';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { GetDashboardTodayTasksQuery } from '../../../../Contexts/Dashboard/application/TodayTasks/GetDashboardTodayTasksQuery';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class GetDashboardTodayTasksController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ success: false, error: 'AUTH_UNAUTHORIZED' });
        return;
      }

      const query = new GetDashboardTodayTasksQuery(user.userId);
      const result = await this.queryBus.ask(query);

      logger.info(`Dashboard today tasks for user ${user.userId}`, 'GetDashboardTodayTasksController');

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error(`Error fetching today tasks: ${error.message}`, 'GetDashboardTodayTasksController');
      next(error);
    }
  }
}