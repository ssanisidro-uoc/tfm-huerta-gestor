import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';

export class GardenId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  get_value(): string {
    return this.value;
  }

  static generate(): GardenId {
    return new GardenId(crypto.randomUUID());
  }
}
