import { StringValueObject } from '../../../Shared/domain/value-object/StringValueObject';

export enum PlotShadeLevelEnum {
  FULL_SUN = 'full_sun',
  PARTIAL_SUN = 'partial_sun',
  PARTIAL_SHADE = 'partial_shade',
  SHADE = 'shade',
  DEEP_SHADE = 'deep_shade'
}

export class PlotShadeLevel extends StringValueObject {
  private static readonly VALID_LEVELS = Object.values(PlotShadeLevelEnum);

  constructor(value: string | null) {
    super(value || '');
    if (value) {
      this.validate(value);
    }
  }

  private validate(shadeLevel: string): void {
    if (!PlotShadeLevel.VALID_LEVELS.includes(shadeLevel as PlotShadeLevelEnum)) {
      throw new Error(
        `Invalid shade level: "${shadeLevel}". Valid levels: ${PlotShadeLevel.VALID_LEVELS.join(', ')}`
      );
    }
  }

  static create(shadeLevel: string | null): PlotShadeLevel {
    return new PlotShadeLevel(shadeLevel);
  }

  has_value(): boolean {
    return this.value.length > 0;
  }

  is_sunny(): boolean {
    return this.value === PlotShadeLevelEnum.FULL_SUN;
  }

  has_shade(): boolean {
    return this.value === PlotShadeLevelEnum.PARTIAL_SHADE ||
           this.value === PlotShadeLevelEnum.SHADE ||
           this.value === PlotShadeLevelEnum.DEEP_SHADE;
  }
}
