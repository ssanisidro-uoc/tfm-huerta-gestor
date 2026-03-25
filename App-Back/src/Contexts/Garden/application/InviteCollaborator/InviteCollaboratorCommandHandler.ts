import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { InviteCollaboratorCommand } from './InviteCollaboratorCommand';
import { CollaboratorInviter } from './CollaboratorInviter';

export class InviteCollaboratorCommandHandler implements CommandHandler<InviteCollaboratorCommand> {
  constructor(private inviter: CollaboratorInviter) {}

  subscribedTo(): Command {
    return InviteCollaboratorCommand;
  }

  async handle(command: InviteCollaboratorCommand): Promise<void> {
    await this.inviter.run(command.gardenId, command.email, command.role, command.invitedBy);
  }
}
