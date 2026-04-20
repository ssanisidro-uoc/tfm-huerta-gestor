import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';

type ThemeValue = 'light' | 'dark' | 'auto';

export class UserPreferencesTheme extends ValueObject<ThemeValue> {
  constructor(value: ThemeValue) {
    super(value);
  }

  static create(value: string): UserPreferencesTheme {
    const validThemes: ThemeValue[] = ['light', 'dark', 'auto'];
    if (!validThemes.includes(value as ThemeValue)) {
      throw new Error(`Invalid theme: ${value}. Must be one of: ${validThemes.join(', ')}`);
    }
    return new UserPreferencesTheme(value as ThemeValue);
  }

  static default(): UserPreferencesTheme {
    return new UserPreferencesTheme('light');
  }

  get_value(): ThemeValue {
    return this.value;
  }
}