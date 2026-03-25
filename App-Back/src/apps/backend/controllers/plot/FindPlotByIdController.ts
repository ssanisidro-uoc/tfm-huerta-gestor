import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { FindPlotByIdQuery } from '../../../../Contexts/Plot/application/FindPlotById/FindPlotByIdQuery';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';

export class FindPlotByIdController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      logger.debug(`Finding plot ${id}`, 'FindPlotByIdController');

      const query = new FindPlotByIdQuery(id);
      const plot = await this.queryBus.ask(query);

      res.status(200).json(plot);
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message.includes('not found')) {
        next(new AppError(404, 'PLOT_NOT_FOUND', err.message));
      } else {
        logger.error('Error finding plot', err, 'FindPlotByIdController');
        next(error);
      }
    }
  }
}
