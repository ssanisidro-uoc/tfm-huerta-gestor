import { StringValueObject } from '../../../Shared/domain/value-object/StringValueObject';

export enum PlotIrrigationTypeEnum {
  MANUAL = 'manual',
  DRIP = 'drip',
  SPRINKLER = 'sprinkler',
  FLOOD = 'flood',
  SUBSURFACE = 'subsurface',
  AUTOMATIC = 'automatic',
  RAINFED = 'rainfed'
}

export class PlotIrrigationType extends StringValueObject {
  private static readonly VALID_TYPES = Object.values(PlotIrrigationTypeEnum);
  private static readonly DEFAULT = PlotIrrigationTypeEnum.MANUAL;

  constructor(value: string | null) {
    super(value || PlotIrrigationType.DEFAULT);
    this.validate(this.value);
  }

  private validate(irrigationType: string): void {
    if (!PlotIrrigationType.VALID_TYPES.includes(irrigationType as PlotIrrigationTypeEnum)) {
      throw new Error(
        `Invalid irrigation type: "${irrigationType}". Valid types: ${PlotIrrigationType.VALID_TYPES.join(', ')}`
      );
    }
  }

  static create(irrigationType: string | null): PlotIrrigationType {
    return new PlotIrrigationType(irrigationType);
  }

  static manual(): PlotIrrigationType {
    return new PlotIrrigationType(PlotIrrigationTypeEnum.MANUAL);
  }

  static drip(): PlotIrrigationType {
    return new PlotIrrigationType(PlotIrrigationTypeEnum.DRIP);
  }

  is_manual(): boolean {
    return this.value === PlotIrrigationTypeEnum.MANUAL;
  }

  is_automated(): boolean {
    return this.value === PlotIrrigationTypeEnum.DRIP ||
           this.value === PlotIrrigationTypeEnum.SPRINKLER ||
           this.value === PlotIrrigationTypeEnum.AUTOMATIC;
  }

  is_rainfed(): boolean {
    return this.value === PlotIrrigationTypeEnum.RAINFED;
  }
}
