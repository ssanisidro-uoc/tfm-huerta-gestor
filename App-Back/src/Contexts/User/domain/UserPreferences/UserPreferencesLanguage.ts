import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';

type LanguageValue = 'es' | 'ca' | 'gl';

export class UserPreferencesLanguage extends ValueObject<LanguageValue> {
  constructor(value: LanguageValue) {
    super(value);
  }

  static create(value: string): UserPreferencesLanguage {
    const validLanguages: LanguageValue[] = ['es', 'ca', 'gl'];
    if (!validLanguages.includes(value as LanguageValue)) {
      throw new Error(`Invalid language: ${value}. Must be one of: ${validLanguages.join(', ')}`);
    }
    return new UserPreferencesLanguage(value as LanguageValue);
  }

  static default(): UserPreferencesLanguage {
    return new UserPreferencesLanguage('es');
  }

  get_value(): LanguageValue {
    return this.value;
  }
}