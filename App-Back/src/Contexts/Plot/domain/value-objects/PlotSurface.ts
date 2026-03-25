import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';

export class PlotSurface extends ValueObject<number> {
  private static readonly MAX_SURFACE = 500000;

  constructor(value: number) {
    super(value);
    this.validate(value);
  }

  private validate(surface: number): void {
    if (surface <= 0) {
      throw new Error(`Surface must be greater than 0, got: ${surface}`);
    }

    if (surface > PlotSurface.MAX_SURFACE) {
      throw new Error(
        `Surface must be less than or equal to ${PlotSurface.MAX_SURFACE} m², got: ${surface}`
      );
    }
  }

  static create(surface: number): PlotSurface {
    return new PlotSurface(surface);
  }

  static from_persistence(value: number | null): PlotSurface {
    if (value === null) {
      throw new Error('Surface cannot be null');
    }
    return new PlotSurface(value);
  }

  get_value(): number {
    return this.value;
  }

  to_persistence(): number {
    return this.value;
  }

  to_square_meters(): number {
    return this.value;
  }

  to_hectares(): number {
    return this.value / 10000;
  }
}
