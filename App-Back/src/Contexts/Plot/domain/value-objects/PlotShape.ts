import { StringValueObject } from '../../../Shared/domain/value-object/StringValueObject';

export enum PlotShapeEnum {
  RECTANGULAR = 'rectangular',
  SQUARE = 'square',
  CIRCULAR = 'circular',
  L_SHAPED = 'L_shaped',
  TRIANGULAR = 'triangular',
  IRREGULAR = 'irregular',
  RAISED_BED = 'raised_bed'
}

export class PlotShape extends StringValueObject {
  private static readonly VALID_SHAPES = Object.values(PlotShapeEnum);

  constructor(value: string | null) {
    super(value || '');
    if (value) {
      this.validate(value);
    }
  }

  private validate(shape: string): void {
    if (!PlotShape.VALID_SHAPES.includes(shape as PlotShapeEnum)) {
      throw new Error(
        `Invalid plot shape: "${shape}". Valid shapes: ${PlotShape.VALID_SHAPES.join(', ')}`
      );
    }
  }

  static create(shape: string | null): PlotShape {
    return new PlotShape(shape);
  }

  has_value(): boolean {
    return this.value.length > 0;
  }

  is_rectangular(): boolean {
    return this.value === PlotShapeEnum.RECTANGULAR;
  }

  is_regular(): boolean {
    return this.value === PlotShapeEnum.RECTANGULAR ||
           this.value === PlotShapeEnum.SQUARE ||
           this.value === PlotShapeEnum.CIRCULAR;
  }
}
