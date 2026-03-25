import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { FindCropByIdQuery } from '../../../../Contexts/Crop/application/FindCropById/FindCropByIdQuery';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';

export class FindCropByIdController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      logger.debug(`Finding crop ${id}`, 'FindCropByIdController');

      const query = new FindCropByIdQuery(id);
      const crop = await this.queryBus.ask(query);

      res.status(200).json(crop);
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message.includes('not found')) {
        next(new AppError(404, 'CROP_NOT_FOUND', err.message));
      } else {
        logger.error('Error finding crop', err, 'FindCropByIdController');
        next(error);
      }
    }
  }
}
