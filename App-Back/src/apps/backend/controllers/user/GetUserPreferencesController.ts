import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { FindUserPreferencesQuery } from '../../../../Contexts/User/application/FindUserPreferences/FindUserPreferencesQuery';

export class GetUserPreferencesController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userid } = req.headers as { userid?: string };

      if (!userid) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      const query = new FindUserPreferencesQuery(userid);
      const result = await this.queryBus.ask(query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error(`Error getting preferences: ${error.message}`, 'GetUserPreferencesController');
      next(error);
    }
  }
}