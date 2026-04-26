import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { RemoveCollaboratorCommand } from './RemoveCollaboratorCommand';
import { CollaboratorRemover } from '../CollaboratorManagement/CollaboratorRemover';
import { PostgresUserGardenRepository } from '../../../UserGarden/infrastructure/persistence/PostgresUserGardenRepository';
import { AppError } from '../../../Shared/domain/AppError';

export class RemoveCollaboratorCommandHandler implements CommandHandler<RemoveCollaboratorCommand> {
  constructor(
    private userGardenRepository: PostgresUserGardenRepository,
    private collaboratorRemover: CollaboratorRemover
  ) {}

  subscribedTo(): Command {
    return RemoveCollaboratorCommand;
  }

  async handle(command: RemoveCollaboratorCommand): Promise<void> {
    const { gardenId, collaboratorId, requestedBy } = command;

    const hasPermission = await this.userGardenRepository.has_permission(requestedBy, gardenId, 'manager');
    if (!hasPermission) {
      throw new AppError(403, 'AUTH_FORBIDDEN', 'You do not have permission to manage collaborators');
    }

    await this.collaboratorRemover.run(collaboratorId, gardenId);
  }
}