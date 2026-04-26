import { Command } from '../../../Shared/domain/Command';

export class RemoveCollaboratorCommand extends Command {
  readonly gardenId: string;
  readonly collaboratorId: string;
  readonly requestedBy: string;

  constructor(gardenId: string, collaboratorId: string, requestedBy: string) {
    super();
    this.gardenId = gardenId;
    this.collaboratorId = collaboratorId;
    this.requestedBy = requestedBy;
  }
}