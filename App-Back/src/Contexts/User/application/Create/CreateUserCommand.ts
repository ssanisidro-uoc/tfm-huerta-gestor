import { Command } from '../../../Shared/domain/Command';

export class CreateUserCommand extends Command {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly email: string,
    readonly password_hash: string,
    readonly role_id: string
  ) {
    super();
  }
}
