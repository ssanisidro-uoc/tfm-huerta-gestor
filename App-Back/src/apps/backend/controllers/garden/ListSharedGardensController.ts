import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { ListSharedGardensQuery } from '../../../../Contexts/Garden/application/ListSharedGardens/ListSharedGardensQuery';

export class ListSharedGardensController {
  constructor(private queryBus: QueryBus) {}

  async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      const query = new ListSharedGardensQuery(user.userId);
      const gardens = await this.queryBus.ask(query);

      logger.info(`Fetching shared gardens for user ${user.userId}`, 'ListSharedGardensController');

      res.status(200).json({
        success: true,
        data: gardens
      });
    } catch (error: any) {
      logger.error(`Error fetching shared gardens: ${error.message}`, 'ListSharedGardensController');
      next(error);
    }
  }

  run(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.execute(req, res, next);
  }
}
