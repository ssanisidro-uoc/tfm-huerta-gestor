import { Command } from '../../../Shared/domain/Command';

export class UpdateProfileCommand extends Command {
  constructor(
    readonly user_id: string,
    readonly name?: string,
    readonly email?: string,
    readonly currentPassword?: string,
    readonly newPassword?: string
  ) {
    super();
  }
}
