import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';

export class PlantingId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  get_value(): string {
    return this.value;
  }

  static generate(): PlantingId {
    return new PlantingId(crypto.randomUUID());
  }
}
