import { StringValueObject } from '../../../Shared/domain/value-object/StringValueObject';

export enum PlotAccessibilityEnum {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  MODERATE = 'moderate',
  DIFFICULT = 'difficult',
  VERY_DIFFICULT = 'very_difficult'
}

export class PlotAccessibility extends StringValueObject {
  private static readonly VALID_LEVELS = Object.values(PlotAccessibilityEnum);

  constructor(value: string | null) {
    super(value || '');
    if (value) {
      this.validate(value);
    }
  }

  private validate(accessibility: string): void {
    if (!PlotAccessibility.VALID_LEVELS.includes(accessibility as PlotAccessibilityEnum)) {
      throw new Error(
        `Invalid accessibility: "${accessibility}". Valid levels: ${PlotAccessibility.VALID_LEVELS.join(', ')}`
      );
    }
  }

  static create(accessibility: string | null): PlotAccessibility {
    return new PlotAccessibility(accessibility);
  }

  has_value(): boolean {
    return this.value.length > 0;
  }

  is_accessible(): boolean {
    return this.value === PlotAccessibilityEnum.EXCELLENT ||
           this.value === PlotAccessibilityEnum.GOOD;
  }

  is_difficult(): boolean {
    return this.value === PlotAccessibilityEnum.DIFFICULT ||
           this.value === PlotAccessibilityEnum.VERY_DIFFICULT;
  }
}
