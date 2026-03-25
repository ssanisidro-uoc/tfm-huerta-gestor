import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { GetPlantingStatusQuery } from '../../../../Contexts/Planting/application/GetPlantingStatus/GetPlantingStatusQuery';

export class GetPlantingStatusController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { planting_id } = req.params;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!planting_id) {
        throw new AppError(400, 'INVALID_REQUEST', 'planting_id is required');
      }

      const query = new GetPlantingStatusQuery(planting_id, user.userId);
      const result = await this.queryBus.ask(query);

      logger.info(`Get phenological status for planting ${planting_id}`, 'GetPlantingStatusController');

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error(`Error getting planting status: ${error.message}`, 'GetPlantingStatusController');
      next(error);
    }
  }
}
