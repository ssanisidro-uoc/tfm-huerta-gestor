import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { UpdateProfileCommand } from './UpdateProfileCommand';
import { ProfileUpdater } from './ProfileUpdater';

export class UpdateProfileCommandHandler implements CommandHandler<UpdateProfileCommand> {
  constructor(private updater: ProfileUpdater) {}

  subscribedTo(): Command {
    return UpdateProfileCommand;
  }

  async handle(command: UpdateProfileCommand): Promise<void> {
    await this.updater.run(command.user_id, {
      name: command.name,
      currentPassword: command.currentPassword,
      newPassword: command.newPassword
    });
  }
}
