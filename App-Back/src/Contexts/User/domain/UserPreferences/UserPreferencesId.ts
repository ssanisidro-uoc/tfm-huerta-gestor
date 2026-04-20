import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';

export class UserPreferencesId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  static create(value: string): UserPreferencesId {
    if (!value || value.trim() === '') {
      throw new Error('UserPreferencesId cannot be empty');
    }
    return new UserPreferencesId(value);
  }

  static create_random(): UserPreferencesId {
    return new UserPreferencesId(crypto.randomUUID());
  }
}