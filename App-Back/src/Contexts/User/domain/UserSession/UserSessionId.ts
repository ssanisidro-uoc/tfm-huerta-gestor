import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';

export class UserSessionId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  static create(value: string): UserSessionId {
    if (!value || value.trim() === '') {
      throw new Error('UserSessionId cannot be empty');
    }
    return new UserSessionId(value);
  }

  static create_random(): UserSessionId {
    return new UserSessionId(crypto.randomUUID());
  }
}