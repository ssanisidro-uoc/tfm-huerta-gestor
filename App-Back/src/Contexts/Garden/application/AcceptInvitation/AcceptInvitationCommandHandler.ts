import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { AcceptInvitationCommand } from './AcceptInvitationCommand';
import { InvitationAcceptor } from './InvitationAcceptor';

export class AcceptInvitationCommandHandler implements CommandHandler<AcceptInvitationCommand> {
  constructor(private acceptor: InvitationAcceptor) {}

  subscribedTo(): Command {
    return AcceptInvitationCommand;
  }

  async handle(command: AcceptInvitationCommand): Promise<void> {
    await this.acceptor.run(command.gardenId, command.userId);
  }
}
