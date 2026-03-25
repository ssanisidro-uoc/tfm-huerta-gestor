import { ValueObject } from '../../Shared/domain/value-object/ValueObject';

export class TaskTitle extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('TaskTitle cannot be empty');
    }
    super(value);
  }

  get_value(): string {
    return this.value;
  }
}
