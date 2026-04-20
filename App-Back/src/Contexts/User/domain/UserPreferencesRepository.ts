import { UserPreferences } from '../domain/UserPreferences/UserPreferences';

export interface UserPreferencesRepository {
  save(preferences: UserPreferences): Promise<void>;
  search_by_user_id(user_id: string): Promise<UserPreferences | null>;
  update(preferences: UserPreferences): Promise<void>;
  delete(user_id: string): Promise<void>;
}