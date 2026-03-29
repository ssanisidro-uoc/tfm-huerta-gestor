import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { UpdateProfileCommand } from '../../../../Contexts/User/application/UpdateProfile/UpdateProfileCommand';

export class UpdateProfileController {
  constructor(private commandBus: CommandBus) {}

  async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userid } = req.headers as { userid?: string };
      const { name, email, currentPassword, newPassword } = req.body;

      if (!userid) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      const command = new UpdateProfileCommand(userid, name, email, currentPassword, newPassword);

      await this.commandBus.dispatch(command);

      logger.info(`User ${userid} profile updated successfully`, 'UpdateProfileController');

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully'
      });
    } catch (error: any) {
      logger.error(`Error updating profile: ${error.message}`, 'UpdateProfileController');
      next(error);
    }
  }

  run(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.execute(req, res, next);
  }
}
