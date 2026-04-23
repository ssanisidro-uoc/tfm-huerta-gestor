import { UserPreferences } from '../../domain/UserPreferences/UserPreferences';
import { UserPreferencesRepository } from '../../domain/UserPreferencesRepository';

export class UserPreferencesFinder {
  constructor(private repository: UserPreferencesRepository) {}

  async run(userId: string): Promise<UserPreferences | null> {
    return this.repository.search_by_user_id(userId);
  }
}