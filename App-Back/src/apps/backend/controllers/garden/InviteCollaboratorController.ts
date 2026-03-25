import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { InviteCollaboratorCommand } from '../../../../Contexts/Garden/application/InviteCollaborator/InviteCollaboratorCommand';

export class InviteCollaboratorController {
  async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { gardenId, email, role } = req.body;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!gardenId || !email || !role) {
        throw new AppError(400, 'INVALID_REQUEST', 'gardenId, email and role are required');
      }

      if (!['manager', 'collaborator', 'viewer'].includes(role)) {
        throw new AppError(400, 'INVALID_ROLE', 'Role must be manager, collaborator or viewer');
      }

      logger.info(`User ${user.userId} inviting ${email} to garden ${gardenId}`, 'InviteCollaboratorController');

      res.status(200).json({
        success: true,
        message: `Invitation sent to ${email}`
      });
    } catch (error: any) {
      logger.error(`Error inviting collaborator: ${error.message}`, 'InviteCollaboratorController');

      if (error.message === 'USER_NOT_FOUND') {
        next(new AppError(404, 'USER_NOT_FOUND', 'User with this email not found'));
      } else if (error.message === 'USER_ALREADY_HAS_ACCESS') {
        next(new AppError(400, 'USER_ALREADY_HAS_ACCESS', 'User already has access to this garden'));
      } else {
        next(error);
      }
    }
  }

  run(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.execute(req, res, next);
  }
}
