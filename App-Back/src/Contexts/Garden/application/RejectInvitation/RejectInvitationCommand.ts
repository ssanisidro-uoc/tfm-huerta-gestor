import { Command } from '../../../Shared/domain/Command';

export class RejectInvitationCommand extends Command {
  constructor(
    readonly gardenId: string,
    readonly userId: string
  ) {
    super();
  }
}
