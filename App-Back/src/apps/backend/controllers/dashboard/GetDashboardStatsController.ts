import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { GetDashboardStatsQuery } from '../../../../Contexts/Dashboard/application/Stats/GetDashboardStatsQuery';
import { DashboardStatsResponse } from '../../../../Contexts/Dashboard/application/Stats/DashboardStatsResponse';

export class GetDashboardStatsController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      const query = new GetDashboardStatsQuery(user.userId);
      const result = await this.queryBus.ask(query) as DashboardStatsResponse;

      logger.info(`Dashboard stats for user ${user.userId}`, 'GetDashboardStatsController');

      res.status(200).json({
        success: true,
        data: {
          total_parcelas: result.total_parcelas,
          parcelas_activas: result.parcelas_activas,
          cultivos_en_curso: result.cultivos_en_curso,
          tareas_pendientes: result.tareas_pendientes,
          tareas_completadas: result.tareas_completadas,
          tareas_atrasadas: result.tareas_atrasadas,
          cosechas_proximas: result.cosechas_proximas
        }
      });
    } catch (error: any) {
      logger.error(`Error fetching dashboard stats: ${error.message}`, 'GetDashboardStatsController');
      next(error);
    }
  }
}
