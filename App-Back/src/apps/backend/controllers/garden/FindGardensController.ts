import { NextFunction, Request, Response } from 'express';
import { FindAllGardensQuery } from '../../../../Contexts/Garden/application/FindAllGardens/FindAllGardensQuery';
import { FindAllGardensResponse } from '../../../../Contexts/Garden/application/FindAllGardens/FindAllGardensResponse';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class FindGardensController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      logger.debug(`Finding gardens for user ${userId}`, 'FindGardensController');

      const query = new FindAllGardensQuery(userId, page, limit);
      const response = (await this.queryBus.ask(query)) as FindAllGardensResponse;

      logger.info(`Found ${response.total} gardens for user ${userId}`, 'FindGardensController');

      res.status(200).json({
        gardens: response.gardens,
        pagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          total_pages: Math.ceil(response.total / response.limit)
        }
      });
    } catch (error: unknown) {
      logger.error('Error finding gardens', error as Error, 'FindGardensController');
      next(error);
    }
  }
}
