import { Command } from '../../../Shared/domain/Command';

export class UpdateCollaboratorRoleCommand extends Command {
  readonly gardenId: string;
  readonly collaboratorId: string;
  readonly role: string;
  readonly requestedBy: string;

  constructor(gardenId: string, collaboratorId: string, role: string, requestedBy: string) {
    super();
    this.gardenId = gardenId;
    this.collaboratorId = collaboratorId;
    this.role = role;
    this.requestedBy = requestedBy;
  }
}