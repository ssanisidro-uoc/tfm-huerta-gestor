import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { RejectInvitationCommand } from './RejectInvitationCommand';
import { InvitationRejector } from './InvitationRejector';

export class RejectInvitationCommandHandler implements CommandHandler<RejectInvitationCommand> {
  constructor(private rejector: InvitationRejector) {}

  subscribedTo(): Command {
    return RejectInvitationCommand;
  }

  async handle(command: RejectInvitationCommand): Promise<void> {
    await this.rejector.run(command.gardenId, command.userId);
  }
}
