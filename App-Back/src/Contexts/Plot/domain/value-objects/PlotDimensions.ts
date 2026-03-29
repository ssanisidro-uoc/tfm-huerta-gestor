import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';

interface PlotDimensionsProps {
  length_m: number | null;
  width_m: number | null;
}

export class PlotDimensions extends ValueObject<PlotDimensionsProps> {
  constructor(props: PlotDimensionsProps) {
    super(props);
    this.validate(props);
  }

  private validate(props: PlotDimensionsProps): void {
    if (props.length_m !== null && props.length_m <= 0) {
      throw new Error(`Length must be greater than 0, got: ${props.length_m}`);
    }

    if (props.width_m !== null && props.width_m <= 0) {
      throw new Error(`Width must be greater than 0, got: ${props.width_m}`);
    }
  }

  static create({
    length,
    width
  }: {
    length: number | null;
    width: number | null;
  }): PlotDimensions {
    return new PlotDimensions({ length_m: length, width_m: width });
  }

  static from_persistence(raw: {
    length_m: number | null;
    width_m: number | null;
  }): PlotDimensions {
    return new PlotDimensions({
      length_m: raw.length_m,
      width_m: raw.width_m
    });
  }

  has_dimensions(): boolean {
    return this.value.length_m !== null && this.value.width_m !== null;
  }

  get_length(): number | null {
    return this.value.length_m;
  }

  get_width(): number | null {
    return this.value.width_m;
  }

  to_persistence(): { length_m: number | null; width_m: number | null } {
    return {
      length_m: this.value.length_m,
      width_m: this.value.width_m
    };
  }
}
