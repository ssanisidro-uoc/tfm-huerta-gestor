import { StringValueObject } from '../../../Shared/domain/value-object/StringValueObject';

export enum PlotSoilQualityEnum {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  AVERAGE = 'average',
  POOR = 'poor',
  VERY_POOR = 'very_poor',
  NOT_EVALUATED = 'not_evaluated'
}

export class PlotSoilQuality extends StringValueObject {
  private static readonly VALID_QUALITIES = Object.values(PlotSoilQualityEnum);

  constructor(value: string | null) {
    super(value || '');
    if (value) {
      this.validate(value);
    }
  }

  private validate(quality: string): void {
    if (!PlotSoilQuality.VALID_QUALITIES.includes(quality as PlotSoilQualityEnum)) {
      throw new Error(
        `Invalid soil quality: "${quality}". Valid qualities: ${PlotSoilQuality.VALID_QUALITIES.join(', ')}`
      );
    }
  }

  static create(quality: string | null): PlotSoilQuality {
    return new PlotSoilQuality(quality);
  }

  has_value(): boolean {
    return this.value.length > 0;
  }

  is_good(): boolean {
    return this.value === PlotSoilQualityEnum.EXCELLENT ||
           this.value === PlotSoilQualityEnum.GOOD;
  }
}
