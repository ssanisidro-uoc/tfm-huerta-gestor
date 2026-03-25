import { StringValueObject } from '../../../Shared/domain/value-object/StringValueObject';

export enum PlotSoilTypeEnum {
  CLAY = 'clay',
  SANDY = 'sandy',
  LOAMY = 'loamy',
  SILTY = 'silty',
  CHALKY = 'chalky',
  HUMUS_RICH = 'humus_rich',
  ROCKY = 'rocky',
  MIXED = 'mixed',
  UNKNOWN = 'unknown'
}

export class PlotSoilType extends StringValueObject {
  private static readonly VALID_TYPES = Object.values(PlotSoilTypeEnum);

  constructor(value: string | null) {
    super(value || '');
    if (value) {
      this.validate(value);
    }
  }

  private validate(soilType: string): void {
    if (!PlotSoilType.VALID_TYPES.includes(soilType as PlotSoilTypeEnum)) {
      throw new Error(
        `Invalid soil type: "${soilType}". Valid types: ${PlotSoilType.VALID_TYPES.join(', ')}`
      );
    }
  }

  static create(soilType: string | null): PlotSoilType {
    return new PlotSoilType(soilType);
  }

  has_value(): boolean {
    return this.value.length > 0;
  }

  is_known(): boolean {
    return this.has_value() && this.value !== PlotSoilTypeEnum.UNKNOWN;
  }
}
