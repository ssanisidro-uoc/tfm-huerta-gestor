import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { FindUserByIdQuery } from '../../../../Contexts/User/application/FindUserById/FindUserByIdQuery';

export class MeController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      logger.debug('Getting current user', 'MeController', { userId: user.userId });

      const query = new FindUserByIdQuery(user.userId);
      const userData = await this.queryBus.ask(query);

      logger.info('User fetched', 'MeController', { userId: user.userId });

      res.status(200).json(userData);
    } catch (error: any) {
      logger.error('Error fetching current user', error, 'MeController');
      next(error);
    }
  }
}
