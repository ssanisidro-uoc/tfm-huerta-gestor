import { Command } from '../../../Shared/domain/Command';

export class UpdateUserCommand extends Command {
  constructor(
    readonly id: string,
    readonly name?: string,
    readonly email?: string,
    readonly password?: string,
    readonly role_id?: string,
    readonly is_active?: boolean
  ) {
    super();
  }
}
