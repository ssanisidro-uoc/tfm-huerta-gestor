import { NextFunction, Request, Response } from 'express';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { GetPlotRotationHistoryQuery } from '../../../../Contexts/Plot/application/RotationHistory/GetPlotRotationHistoryQuery';
import { PlotRotationHistoryResponse } from '../../../../Contexts/Plot/application/RotationHistory/PlotRotationHistoryResponse';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class GetPlotRotationHistoryController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { plot_id } = req.params;
      const user = (req as any).user;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!plot_id) {
        throw new AppError(400, 'MISSING_PLOT', 'plot_id is required');
      }

      const query = new GetPlotRotationHistoryQuery(plot_id, user.userId);
      const result = await this.queryBus.ask(query) as PlotRotationHistoryResponse;

      logger.debug(`Fetched rotation history for plot ${plot_id}`, 'GetPlotRotationHistoryController');

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error(`Error fetching plot rotation history: ${error.message}`, 'GetPlotRotationHistoryController');
      next(error);
    }
  }
}