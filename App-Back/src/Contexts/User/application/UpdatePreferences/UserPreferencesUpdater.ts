import { UserPreferencesRepository } from '../../domain/UserPreferencesRepository';
import { UserPreferences } from '../../domain/UserPreferences/UserPreferences';

export class UserPreferencesUpdater {
  constructor(private repository: UserPreferencesRepository) {}

  async run(
    userId: string,
    data: {
      language?: string;
      theme?: string;
      notifications_enabled?: boolean;
    }
  ): Promise<void> {
    let preferences = await this.repository.search_by_user_id(userId);

    if (!preferences) {
      preferences = UserPreferences.create(userId);
    }

    if (data.language !== undefined) {
      preferences = preferences.updateLanguage(data.language);
    }

    if (data.theme !== undefined) {
      preferences = preferences.updateTheme(data.theme);
    }

    if (data.notifications_enabled !== undefined) {
      preferences = preferences.updateNotifications(data.notifications_enabled);
    }

    await this.repository.save(preferences);
  }
}