import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { FindCropCompatibilitiesQuery } from '../../../../Contexts/Crop/application/FindCropCompatibilities/FindCropCompatibilitiesQuery';

export class GetCropCompatibilitiesController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { crop_id } = req.params;
      const { type } = req.query as { type?: 'companions' | 'incompatible' | 'all' };

      if (!crop_id) {
        throw new AppError(400, 'VALIDATION_ERROR', 'crop_id is required');
      }

      const query = new FindCropCompatibilitiesQuery(crop_id, type);
      const result = await this.queryBus.ask(query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error(`Error getting crop compatibilities: ${error.message}`, 'GetCropCompatibilitiesController');
      next(error);
    }
  }
}