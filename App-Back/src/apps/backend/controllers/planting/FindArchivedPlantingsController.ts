import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { FindArchivedPlantingsQuery } from '../../../../Contexts/Planting/application/FindArchivedPlantings/FindArchivedPlantingsQuery';
import { FindArchivedPlantingsResponse } from '../../../../Contexts/Planting/application/FindArchivedPlantings/FindArchivedPlantingsResponse';

export class FindArchivedPlantingsController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const garden_id = req.params.garden_id;
      const user_id = req.body.user?.id;

      if (!garden_id) {
        res.status(400).json({ error: 'Garden ID is required' });
        return;
      }

      logger.debug(`Finding archived plantings for garden ${garden_id}`, 'FindArchivedPlantingsController');

      const query = new FindArchivedPlantingsQuery(garden_id);
      const response = await this.queryBus.ask(query) as FindArchivedPlantingsResponse;

      res.status(200).json({
        plantings: response.plantings
      });
    } catch (error: unknown) {
      logger.error('Error finding archived plantings', error as Error, 'FindArchivedPlantingsController');
      next(error);
    }
  }
}
