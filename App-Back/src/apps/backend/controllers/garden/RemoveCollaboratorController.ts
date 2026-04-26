import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { RemoveCollaboratorCommand } from '../../../../Contexts/Garden/application/RemoveCollaborator/RemoveCollaboratorCommand';

export class RemoveCollaboratorController {
  constructor(private commandBus: CommandBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { gardenId, collaboratorId } = req.params;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!gardenId || !collaboratorId) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Garden ID and Collaborator ID are required');
      }

      const command = new RemoveCollaboratorCommand(gardenId, collaboratorId, user.userId);
      await this.commandBus.dispatch(command);

      logger.info(`Removed collaborator ${collaboratorId} from garden ${gardenId}`, 'RemoveCollaboratorController');

      res.status(200).json({
        success: true,
        message: 'Collaborator removed successfully'
      });
    } catch (error: any) {
      logger.error(`Error removing collaborator: ${error.message}`, 'RemoveCollaboratorController');
      next(error);
    }
  }
}