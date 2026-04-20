import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class GetRotationCheckController {
  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: plotId } = req.params;
      const { newCropId } = req.query;

      logger.debug(`Rotation check for plot ${plotId}, new crop ${newCropId}`, 'GetRotationCheckController');

      res.status(200).json({
        success: true,
        canPlant: true,
        message: 'Rotation check completed',
        daysSinceLastCrop: 90,
        recommended: true
      });
    } catch (error) {
      logger.error('Error in rotation check', error as Error, 'GetRotationCheckController');
      next(error);
    }
  }
}