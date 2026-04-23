import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { UpdatePreferencesCommand } from './UpdatePreferencesCommand';
import { UserPreferencesUpdater } from './UserPreferencesUpdater';

export class UpdatePreferencesCommandHandler implements CommandHandler<UpdatePreferencesCommand> {
  constructor(private updater: UserPreferencesUpdater) {}

  subscribedTo(): Command {
    return UpdatePreferencesCommand;
  }

  async handle(command: UpdatePreferencesCommand): Promise<void> {
    await this.updater.run(command.user_id, {
      language: command.language,
      theme: command.theme,
      notifications_enabled: command.notifications_enabled
    });
  }
}