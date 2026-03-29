import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { RejectInvitationCommand } from '../../../../Contexts/Garden/application/RejectInvitation/RejectInvitationCommand';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';

export class RejectInvitationController {
  constructor(private commandBus: CommandBus) {}

  async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const gardenId = req.params.gardenId;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!gardenId) {
        throw new AppError(400, 'INVALID_REQUEST', 'gardenId is required');
      }

      logger.info(`User ${user.userId} rejecting invitation to garden ${gardenId}`, 'RejectInvitationController');

      const command = new RejectInvitationCommand(gardenId, user.userId);

      await this.commandBus.dispatch(command);

      res.status(200).json({
        success: true,
        message: 'Invitation rejected successfully'
      });
    } catch (error: any) {
      logger.error(`Error rejecting invitation: ${error.message}`, 'RejectInvitationController');

      if (error.message === 'INVITATION_NOT_FOUND') {
        next(new AppError(404, 'INVITATION_NOT_FOUND', 'No invitation found for this garden'));
      } else {
        next(error);
      }
    }
  }

  run(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.execute(req, res, next);
  }
}
