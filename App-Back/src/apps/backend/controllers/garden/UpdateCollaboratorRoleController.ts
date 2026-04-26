import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { UpdateCollaboratorRoleCommand } from '../../../../Contexts/Garden/application/UpdateCollaboratorRole/UpdateCollaboratorRoleCommand';

export class UpdateCollaboratorRoleController {
  constructor(private commandBus: CommandBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { gardenId, collaboratorId } = req.params;
      const { role } = req.body;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!gardenId || !collaboratorId) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Garden ID and Collaborator ID are required');
      }

      const validRoles = ['owner', 'manager', 'collaborator', 'viewer'];
      if (!role || !validRoles.includes(role)) {
        throw new AppError(400, 'VALIDATION_ERROR', `Role must be one of: ${validRoles.join(', ')}`);
      }

      if (role === 'owner') {
        throw new AppError(400, 'VALIDATION_ERROR', 'Cannot assign owner role');
      }

      const command = new UpdateCollaboratorRoleCommand(gardenId, collaboratorId, role, user.userId);
      await this.commandBus.dispatch(command);

      logger.info(`Updated collaborator ${collaboratorId} role to ${role} in garden ${gardenId}`, 'UpdateCollaboratorRoleController');

      res.status(200).json({
        success: true,
        message: 'Collaborator role updated successfully',
        data: {
          user_id: collaboratorId,
          garden_id: gardenId,
          role: role
        }
      });
    } catch (error: any) {
      logger.error(`Error updating collaborator role: ${error.message}`, 'UpdateCollaboratorRoleController');
      next(error);
    }
  }
}