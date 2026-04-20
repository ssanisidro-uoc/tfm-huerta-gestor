import { AggregateRoot } from '../../../Shared/domain/AggregateRoot';
import { UserPreferencesId } from './UserPreferencesId';
import { UserPreferencesLanguage } from './UserPreferencesLanguage';
import { UserPreferencesTheme } from './UserPreferencesTheme';

export interface UserPreferencesProps {
  id: string;
  user_id: string;
  language: string;
  theme: string;
  notifications_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export class UserPreferences extends AggregateRoot {
  readonly id: UserPreferencesId;
  readonly user_id: string;
  readonly language: UserPreferencesLanguage;
  readonly theme: UserPreferencesTheme;
  readonly notifications_enabled: boolean;
  readonly created_at: Date;
  readonly updated_at: Date;

  constructor(
    id: UserPreferencesId,
    user_id: string,
    language: UserPreferencesLanguage,
    theme: UserPreferencesTheme,
    notifications_enabled: boolean,
    created_at: Date,
    updated_at: Date
  ) {
    super();
    this.id = id;
    this.user_id = user_id;
    this.language = language;
    this.theme = theme;
    this.notifications_enabled = notifications_enabled;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static create(user_id: string): UserPreferences {
    const now = new Date();
    return new UserPreferences(
      UserPreferencesId.create_random(),
      user_id,
      UserPreferencesLanguage.default(),
      UserPreferencesTheme.default(),
      true,
      now,
      now
    );
  }

  static from_persistence(raw: UserPreferencesProps): UserPreferences {
    return new UserPreferences(
      new UserPreferencesId(raw.id),
      raw.user_id,
      UserPreferencesLanguage.create(raw.language),
      UserPreferencesTheme.create(raw.theme),
      raw.notifications_enabled,
      new Date(raw.created_at),
      new Date(raw.updated_at)
    );
  }

  to_persistence(): any {
    return {
      id: this.id.get_value(),
      user_id: this.user_id,
      language: this.language.get_value(),
      theme: this.theme.get_value(),
      notifications_enabled: this.notifications_enabled,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  to_response(): any {
    return {
      id: this.id.get_value(),
      user_id: this.user_id,
      language: this.language.get_value(),
      theme: this.theme.get_value(),
      notifications_enabled: this.notifications_enabled
    };
  }

  updateLanguage(language: string): UserPreferences {
    return new UserPreferences(
      this.id,
      this.user_id,
      UserPreferencesLanguage.create(language),
      this.theme,
      this.notifications_enabled,
      this.created_at,
      new Date()
    );
  }

  updateTheme(theme: string): UserPreferences {
    return new UserPreferences(
      this.id,
      this.user_id,
      this.language,
      UserPreferencesTheme.create(theme),
      this.notifications_enabled,
      this.created_at,
      new Date()
    );
  }

  updateNotifications(enabled: boolean): UserPreferences {
    return new UserPreferences(
      this.id,
      this.user_id,
      this.language,
      this.theme,
      enabled,
      this.created_at,
      new Date()
    );
  }
}