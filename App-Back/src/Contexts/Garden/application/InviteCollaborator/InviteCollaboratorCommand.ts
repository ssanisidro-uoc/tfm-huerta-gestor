import { Command } from '../../../Shared/domain/Command';

export class InviteCollaboratorCommand implements Command {
  constructor(
    readonly gardenId: string,
    readonly email: string,
    readonly role: string,
    readonly invitedBy: string
  ) {}
}
