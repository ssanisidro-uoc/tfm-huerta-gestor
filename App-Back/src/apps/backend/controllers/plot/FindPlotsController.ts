import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { FindAllPlotsQuery } from '../../../../Contexts/Plot/application/FindAllPlots/FindAllPlotsQuery';
import { FindAllPlotsResponse } from '../../../../Contexts/Plot/application/FindAllPlots/FindAllPlotsResponse';

export class FindPlotsController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { gardenId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      logger.debug(`Finding plots for garden ${gardenId}`, 'FindPlotsController');

      const query = new FindAllPlotsQuery(gardenId, page, limit);
      const response = await this.queryBus.ask(query) as FindAllPlotsResponse;

      logger.info(`Found ${response.total} plots in garden ${gardenId}`, 'FindPlotsController');

      res.status(200).json({
        plots: response.plots,
        pagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          total_pages: Math.ceil(response.total / response.limit)
        }
      });
    } catch (error: unknown) {
      logger.error('Error finding plots', error as Error, 'FindPlotsController');
      next(error);
    }
  }
}
