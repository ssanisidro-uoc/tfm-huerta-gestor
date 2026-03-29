import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { FindPlantingByIdQuery } from '../../../../Contexts/Planting/application/FindPlantingById/FindPlantingByIdQuery';
import { FindPlantingByIdResponse } from '../../../../Contexts/Planting/application/FindPlantingById/FindPlantingByIdResponse';

export class FindPlantingByIdController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { planting_id } = req.params;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!planting_id) {
        throw new AppError(400, 'VALIDATION_ERROR', 'planting_id is required');
      }

      const query = new FindPlantingByIdQuery(planting_id);
      const result = await this.queryBus.ask(query) as FindPlantingByIdResponse;

      logger.info(`Found planting ${planting_id}`, 'FindPlantingByIdController');

      res.status(200).json({
        success: true,
        data: {
          id: result.id,
          crop_id: result.crop_id,
          garden_id: result.garden_id,
          plot_id: result.plot_id,
          planted_at: result.planted_at,
          expected_harvest_at: result.expected_harvest_at,
          harvested_at: result.harvested_at,
          quantity: result.quantity,
          status: result.is_active ? 'growing' : 'harvested'
        }
      });
    } catch (error: any) {
      logger.error(`Error fetching planting: ${error.message}`, 'FindPlantingByIdController');
      next(error);
    }
  }
}
