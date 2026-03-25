import crypto from 'crypto';
import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';

export class PlotId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    if (!value || value.trim().length === 0) {
      throw new Error('PlotId cannot be empty');
    }
  }

  get_value(): string {
    return this.value;
  }

  static generate(): PlotId {
    return new PlotId(crypto.randomUUID());
  }
}
