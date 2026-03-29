import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { FindAllCropsQuery } from '../../../../Contexts/Crop/application/FindAllCrops/FindAllCropsQuery';
import { FindAllCropsResponse } from '../../../../Contexts/Crop/application/FindAllCrops/FindAllCropsResponse';

export class FindCropsController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const category = req.query.category as string | undefined;
      const family = req.query.family as string | undefined;
      const search = req.query.search as string | undefined;

      logger.debug(`Finding crops`, 'FindCropsController');

      const query = new FindAllCropsQuery(page, limit, { category, family, search });
      const response = await this.queryBus.ask(query) as FindAllCropsResponse;

      res.status(200).json({
        crops: response.crops,
        pagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          total_pages: Math.ceil(response.total / response.limit)
        }
      });
    } catch (error: unknown) {
      logger.error('Error finding crops', error as Error, 'FindCropsController');
      next(error);
    }
  }
}
