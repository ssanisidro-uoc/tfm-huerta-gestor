import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';

export class UserGardenId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  get_value(): string {
    return this.value;
  }

  static generate(): UserGardenId {
    return new UserGardenId(crypto.randomUUID());
  }
}
