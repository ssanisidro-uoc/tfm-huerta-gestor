import { NextFunction, Request, Response } from 'express';
import { InviteCollaboratorCommand } from '../../../../Contexts/Garden/application/InviteCollaborator/InviteCollaboratorCommand';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class InviteCollaboratorController {
  constructor(private commandBus: CommandBus) {}

  async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const gardenId = req.params.gardenId;
      const { email, role } = req.body;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!gardenId || !email || !role) {
        throw new AppError(400, 'INVALID_REQUEST', 'gardenId (path), email and role are required');
      }

      if (!['manager', 'collaborator', 'viewer'].includes(role)) {
        throw new AppError(400, 'INVALID_ROLE', 'Role must be manager, collaborator or viewer');
      }

      logger.info(
        `User ${user.userId} inviting ${email} to garden ${gardenId}`,
        'InviteCollaboratorController'
      );

      const command = new InviteCollaboratorCommand(gardenId, email, role, user.userId);

      await this.commandBus.dispatch(command);

      res.status(200).json({
        success: true,
        message: `Invitation sent to ${email}`
      });
    } catch (error: any) {
      logger.error(`Error inviting collaborator: ${error.message}`, 'InviteCollaboratorController');

      if (error.message === 'USER_NOT_FOUND') {
        next(new AppError(404, 'USER_NOT_FOUND', 'User with this email not found'));
      } else if (error.message === 'USER_ALREADY_HAS_ACCESS') {
        next(
          new AppError(400, 'USER_ALREADY_HAS_ACCESS', 'User already has access to this garden')
        );
      } else {
        next(error);
      }
    }
  }

  run(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.execute(req, res, next);
  }
}
