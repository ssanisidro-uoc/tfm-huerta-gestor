import { StringValueObject } from '../../../Shared/domain/value-object/StringValueObject';

export enum GardenClimateZoneEnum {
  MEDITERRANEAN_COAST = 'mediterranean_coast',
  MEDITERRANEAN_INTERIOR = 'mediterranean_interior',
  ATLANTIC = 'atlantic',
  CONTINENTAL = 'continental',
  MOUNTAIN = 'mountain',
  SUBTROPICAL = 'subtropical',
  SEMIARID = 'semiarid',
  CANARY_ISLANDS = 'canary_islands'
}

export class GardenClimateZone extends StringValueObject {
  private static readonly VALID_ZONES = Object.values(GardenClimateZoneEnum);

  constructor(value: string) {
    super(value);
    this.validate(value);
  }

  private validate(zone: string): void {
    if (!GardenClimateZone.VALID_ZONES.includes(zone as GardenClimateZoneEnum)) {
      throw new Error(
        `Invalid climate zone: "${zone}". Valid zones are: ${GardenClimateZone.VALID_ZONES.join(', ')}`
      );
    }
  }

  static mediterranean_coast(): GardenClimateZone {
    return new GardenClimateZone(GardenClimateZoneEnum.MEDITERRANEAN_COAST);
  }

  static mediterranean_interior(): GardenClimateZone {
    return new GardenClimateZone(GardenClimateZoneEnum.MEDITERRANEAN_INTERIOR);
  }

  static atlantic(): GardenClimateZone {
    return new GardenClimateZone(GardenClimateZoneEnum.ATLANTIC);
  }

  static continental(): GardenClimateZone {
    return new GardenClimateZone(GardenClimateZoneEnum.CONTINENTAL);
  }

  static mountain(): GardenClimateZone {
    return new GardenClimateZone(GardenClimateZoneEnum.MOUNTAIN);
  }

  static subtropical(): GardenClimateZone {
    return new GardenClimateZone(GardenClimateZoneEnum.SUBTROPICAL);
  }

  static semiarid(): GardenClimateZone {
    return new GardenClimateZone(GardenClimateZoneEnum.SEMIARID);
  }

  static canary_islands(): GardenClimateZone {
    return new GardenClimateZone(GardenClimateZoneEnum.CANARY_ISLANDS);
  }

  is_mediterranean(): boolean {
    return this.value === GardenClimateZoneEnum.MEDITERRANEAN_COAST ||
           this.value === GardenClimateZoneEnum.MEDITERRANEAN_INTERIOR;
  }

  is_continental(): boolean {
    return this.value === GardenClimateZoneEnum.CONTINENTAL;
  }

  is_mountain(): boolean {
    return this.value === GardenClimateZoneEnum.MOUNTAIN;
  }
}
