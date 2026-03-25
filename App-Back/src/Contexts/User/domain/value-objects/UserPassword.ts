import { StringValueObject } from '../../../Shared/domain/value-object/StringValueObject';

export class UserPassword extends StringValueObject {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 100;

  constructor(value: string) {
    super(value);
    this.validate(value);
  }

  private validate(password: string): void {
    if (password.length < UserPassword.MIN_LENGTH) {
      throw new Error(`Password must be at least ${UserPassword.MIN_LENGTH} characters`);
    }
    if (password.length > UserPassword.MAX_LENGTH) {
      throw new Error(`Password must not exceed ${UserPassword.MAX_LENGTH} characters`);
    }
  }
}
