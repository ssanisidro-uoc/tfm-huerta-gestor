import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';

export class CropName extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('CropName cannot be empty');
    }
    super(value);
  }

  get_value(): string {
    return this.value;
  }
}
