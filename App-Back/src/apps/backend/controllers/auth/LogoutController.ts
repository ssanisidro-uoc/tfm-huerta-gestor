import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { LogoutCommand } from '../../../../Contexts/User/application/Logout/LogoutCommand';

export class LogoutController {
  constructor(private commandBus: CommandBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const token = (req as any).headers.authorization?.replace('Bearer ', '');

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      const command = new LogoutCommand(user.userId, token);
      await this.commandBus.dispatch(command);

      logger.info(`User ${user.userId} logged out`, 'LogoutController');

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error: any) {
      logger.error('Error during logout', error, 'LogoutController');
      next(error);
    }
  }
}
