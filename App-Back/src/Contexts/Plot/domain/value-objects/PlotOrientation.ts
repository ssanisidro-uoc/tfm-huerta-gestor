import { StringValueObject } from '../../../Shared/domain/value-object/StringValueObject';

export enum PlotOrientationEnum {
  NORTH = 'north',
  SOUTH = 'south',
  EAST = 'east',
  WEST = 'west',
  NORTHEAST = 'northeast',
  NORTHWEST = 'northwest',
  SOUTHEAST = 'southeast',
  SOUTHWEST = 'southwest',
  FLAT = 'flat',
  VARIABLE = 'variable'
}

export class PlotOrientation extends StringValueObject {
  private static readonly VALID_ORIENTATIONS = Object.values(PlotOrientationEnum);

  constructor(value: string | null) {
    super(value || '');
    if (value) {
      this.validate(value);
    }
  }

  private validate(orientation: string): void {
    if (!PlotOrientation.VALID_ORIENTATIONS.includes(orientation as PlotOrientationEnum)) {
      throw new Error(
        `Invalid orientation: "${orientation}". Valid orientations: ${PlotOrientation.VALID_ORIENTATIONS.join(', ')}`
      );
    }
  }

  static create(orientation: string | null): PlotOrientation {
    return new PlotOrientation(orientation);
  }

  has_value(): boolean {
    return this.value.length > 0;
  }

  is_southern(): boolean {
    return this.value === PlotOrientationEnum.SOUTH ||
           this.value === PlotOrientationEnum.SOUTHEAST ||
           this.value === PlotOrientationEnum.SOUTHWEST;
  }

  is_northern(): boolean {
    return this.value === PlotOrientationEnum.NORTH ||
           this.value === PlotOrientationEnum.NORTHEAST ||
           this.value === PlotOrientationEnum.NORTHWEST;
  }
}
