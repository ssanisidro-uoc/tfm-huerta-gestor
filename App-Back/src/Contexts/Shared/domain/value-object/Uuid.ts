import { v4 as uuid_v4 } from 'uuid';
import { ValueObject } from './ValueObject';

export class Uuid extends ValueObject<string> {
  constructor(value?: string) {
    super(value || uuid_v4());
  }

  static random(): Uuid {
    return new Uuid();
  }

  static from_string(value: string): Uuid {
    return new Uuid(value);
  }
}
