import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';

export class GardenName extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('GardenName cannot be empty');
    }
    super(value);
  }

  get_value(): string {
    return this.value;
  }
}
