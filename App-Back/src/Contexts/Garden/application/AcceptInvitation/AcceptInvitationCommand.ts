import { Command } from '../../../Shared/domain/Command';

export class AcceptInvitationCommand extends Command {
  constructor(
    readonly gardenId: string,
    readonly userId: string
  ) {
    super();
  }
}
