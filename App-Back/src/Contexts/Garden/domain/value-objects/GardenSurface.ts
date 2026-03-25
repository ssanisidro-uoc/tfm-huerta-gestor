import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';

export class GardenSurface extends ValueObject<number | null> {
  private static readonly MAX_SURFACE = 1000000;

  constructor(value: number | null) {
    super(value);
    if (value !== null) {
      this.validate(value);
    }
  }

  private validate(surface: number): void {
    if (surface <= 0) {
      throw new Error(`Surface must be greater than 0, got: ${surface}`);
    }

    if (surface > GardenSurface.MAX_SURFACE) {
      throw new Error(
        `Surface must be less than or equal to ${GardenSurface.MAX_SURFACE} m², got: ${surface}`
      );
    }
  }

  static create(surface: number | null): GardenSurface {
    return new GardenSurface(surface);
  }

  static from_persistence(value: number | null): GardenSurface {
    return new GardenSurface(value);
  }

  has_value(): boolean {
    return this.value !== null;
  }

  to_persistence(): number | null {
    return this.value;
  }

  to_square_meters(): number {
    return this.value || 0;
  }

  to_hectares(): number {
    return (this.value || 0) / 10000;
  }

  to_acres(): number {
    return (this.value || 0) * 0.000247105;
  }
}
