import { StringValueObject } from '../../Shared/domain/value-object/StringValueObject';

export class UserEmail extends StringValueObject {
  constructor(value: string) {
    super(value);
    this.validate_email(value);
  }

  private validate_email(email: string): void {
    const email_regex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_regex.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }
  }
}
