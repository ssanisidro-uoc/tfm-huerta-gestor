import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { FindUserByIdQuery } from '../../../../Contexts/User/application/FindUserById/FindUserByIdQuery';

export class FindUserByIdController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      logger.debug('Finding user by id', 'FindUserByIdController', { id });

      const query: FindUserByIdQuery = new FindUserByIdQuery(id);
      const response = await this.queryBus.ask(query);

      logger.info('User found', 'FindUserByIdController', { id });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error finding user', error, 'FindUserByIdController', {
        id: req.params?.id
      });
      next(error);
    }
  }
}
