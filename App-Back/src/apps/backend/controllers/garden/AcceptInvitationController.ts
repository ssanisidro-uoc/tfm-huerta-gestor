import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { AcceptInvitationCommand } from '../../../../Contexts/Garden/application/AcceptInvitation/AcceptInvitationCommand';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';

export class AcceptInvitationController {
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

      logger.info(`User ${user.userId} accepting invitation to garden ${gardenId}`, 'AcceptInvitationController');

      const command = new AcceptInvitationCommand(gardenId, user.userId);

      await this.commandBus.dispatch(command);

      res.status(200).json({
        success: true,
        message: 'Invitation accepted successfully'
      });
    } catch (error: any) {
      logger.error(`Error accepting invitation: ${error.message}`, 'AcceptInvitationController');

      if (error.message === 'INVITATION_NOT_FOUND') {
        next(new AppError(404, 'INVITATION_NOT_FOUND', 'No invitation found for this garden'));
      } else if (error.message === 'INVITATION_ALREADY_ACCEPTED') {
        next(new AppError(400, 'INVITATION_ALREADY_ACCEPTED', 'Invitation already accepted'));
      } else {
        next(error);
      }
    }
  }

  run(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.execute(req, res, next);
  }
}
