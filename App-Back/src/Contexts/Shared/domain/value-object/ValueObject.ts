export abstract class ValueObject<T> {
  protected value: T;

  constructor(value: T) {
    this.value = value;
  }

  get_value(): T {
    return this.value;
  }

  equals_to(other: ValueObject<T>): boolean {
    return this.constructor === other.constructor && this.value === other.value;
  }
}
