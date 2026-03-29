import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { FindPlantingsByPlotQuery } from '../../../../Contexts/Planting/application/FindPlantingsByPlot/FindPlantingsByPlotQuery';
import { FindPlantingsByPlotResponse } from '../../../../Contexts/Planting/application/FindPlantingsByPlot/FindPlantingsByPlotResponse';

export class FindPlantingsByPlotController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { plot_id } = req.params;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!plot_id) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Plot ID is required');
      }

      const query = new FindPlantingsByPlotQuery(plot_id, user.userId);
      const result = await this.queryBus.ask(query) as FindPlantingsByPlotResponse;

      logger.info(`Found ${result.plantings.length} plantings for plot ${plot_id}`, 'FindPlantingsByPlotController');

      res.status(200).json({
        success: true,
        data: result.plantings
      });
    } catch (error: any) {
      logger.error(`Error fetching plantings by plot: ${error.message}`, 'FindPlantingsByPlotController');
      next(error);
    }
  }
}
