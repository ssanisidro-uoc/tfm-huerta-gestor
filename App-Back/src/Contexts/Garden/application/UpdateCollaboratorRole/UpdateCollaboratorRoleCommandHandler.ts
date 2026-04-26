import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { UpdateCollaboratorRoleCommand } from './UpdateCollaboratorRoleCommand';
import { CollaboratorUpdater } from '../CollaboratorManagement/CollaboratorUpdater';
import { PostgresUserGardenRepository } from '../../../UserGarden/infrastructure/persistence/PostgresUserGardenRepository';
import { AppError } from '../../../Shared/domain/AppError';

export class UpdateCollaboratorRoleCommandHandler implements CommandHandler<UpdateCollaboratorRoleCommand> {
  constructor(
    private userGardenRepository: PostgresUserGardenRepository,
    private collaboratorUpdater: CollaboratorUpdater
  ) {}

  subscribedTo(): Command {
    return UpdateCollaboratorRoleCommand;
  }

  async handle(command: UpdateCollaboratorRoleCommand): Promise<void> {
    const { gardenId, collaboratorId, role, requestedBy } = command;

    const hasPermission = await this.userGardenRepository.has_permission(requestedBy, gardenId, 'manager');
    if (!hasPermission) {
      throw new AppError(403, 'AUTH_FORBIDDEN', 'You do not have permission to manage collaborators');
    }

    await this.collaboratorUpdater.run(collaboratorId, gardenId, role);
  }
}