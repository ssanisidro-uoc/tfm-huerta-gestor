import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { FindPlantingsQuery } from '../../../../Contexts/Planting/application/FindPlantings/FindPlantingsQuery';
import { FindPlantingsResponse } from '../../../../Contexts/Planting/application/FindPlantings/FindPlantingsResponse';

export class FindPlantingsController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      const query = new FindPlantingsQuery(user.userId);
      const result = await this.queryBus.ask(query) as FindPlantingsResponse;

      logger.info(`Found ${result.plantings.length} plantings for user ${user.userId}`, 'FindPlantingsController');

      res.status(200).json({
        success: true,
        data: result.plantings
      });
    } catch (error: any) {
      logger.error(`Error fetching plantings: ${error.message}`, 'FindPlantingsController');
      next(error);
    }
  }
}
