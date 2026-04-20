import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { UpdatePreferencesCommand } from './UpdatePreferencesCommand';
import { UserPreferencesRepository } from '../../domain/UserPreferencesRepository';
import { UserPreferences } from '../../domain/UserPreferences/UserPreferences';

export class UpdatePreferencesCommandHandler implements CommandHandler<UpdatePreferencesCommand> {
  constructor(private userPreferencesRepository: UserPreferencesRepository) {}

  subscribedTo(): Command {
    return UpdatePreferencesCommand;
  }

  async handle(command: UpdatePreferencesCommand): Promise<void> {
    let preferences = await this.userPreferencesRepository.search_by_user_id(command.user_id);

    if (!preferences) {
      preferences = UserPreferences.create(command.user_id);
    }

    if (command.language !== undefined) {
      preferences = preferences.updateLanguage(command.language);
    }

    if (command.theme !== undefined) {
      preferences = preferences.updateTheme(command.theme);
    }

    if (command.notifications_enabled !== undefined) {
      preferences = preferences.updateNotifications(command.notifications_enabled);
    }

    await this.userPreferencesRepository.save(preferences);
  }
}