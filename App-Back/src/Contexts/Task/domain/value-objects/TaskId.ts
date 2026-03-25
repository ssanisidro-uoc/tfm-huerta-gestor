import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';

export class TaskId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  get_value(): string {
    return this.value;
  }

  static generate(): TaskId {
    return new TaskId(crypto.randomUUID());
  }
}
