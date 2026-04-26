import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { GetMyGardensQuery } from '../../../../Contexts/Garden/application/GetMyGardens/GetMyGardensQuery';

export class GetMyGardensController {
  constructor(private queryBus: QueryBus) {}

  async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      const query = new GetMyGardensQuery(user.userId);
      const result = await this.queryBus.ask(query);

      logger.info(`Fetching my gardens for user ${user.userId}`, 'GetMyGardensController');

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error(`Error fetching my gardens: ${error.message}`, 'GetMyGardensController');
      next(error);
    }
  }

  run(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.execute(req, res, next);
  }
}