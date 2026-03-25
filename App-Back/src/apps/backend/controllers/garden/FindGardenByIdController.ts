import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { FindGardenByIdQuery } from '../../../../Contexts/Garden/application/FindGardenById/FindGardenByIdQuery';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';

export class FindGardenByIdController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      logger.debug(`Finding garden ${id} for user ${userId}`, 'FindGardenByIdController');

      const query = new FindGardenByIdQuery(id);
      const garden = await this.queryBus.ask(query);

      res.status(200).json(garden);
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message.includes('not found')) {
        next(new AppError(404, 'GARDEN_NOT_FOUND', err.message));
      } else {
        logger.error('Error finding garden', err, 'FindGardenByIdController');
        next(error);
      }
    }
  }
}
