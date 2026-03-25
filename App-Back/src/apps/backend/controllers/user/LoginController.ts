import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { LoginQuery } from '../../../../Contexts/User/application/Login/LoginQuery';

export class LoginController {
  constructor(private queryBus: QueryBus) {}

  async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError(400, 'AUTH_MISSING_CREDENTIALS', 'Email and password are required');
      }

      const query = new LoginQuery(email, password);
      const result = await this.queryBus.ask(query);

      logger.info(`User logged in successfully`, 'LoginController');

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error(`Error during login: ${error.message}`, 'LoginController');
      next(error);
    }
  }

  run(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.execute(req, res, next);
  }
}
