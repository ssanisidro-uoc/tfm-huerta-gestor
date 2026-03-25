import { StringValueObject } from '../../../Shared/domain/value-object/StringValueObject';

export class GardenHardinessZone extends StringValueObject {
  private static readonly ZONE_REGEX = /^[1-9][0-9]?[a-b]?$/;

  constructor(value: string | null) {
    super(value || '');
    if (value) {
      this.validate(value);
    }
  }

  private validate(zone: string): void {
    if (!GardenHardinessZone.ZONE_REGEX.test(zone)) {
      throw new Error(
        `Invalid hardiness zone: "${zone}". Valid format: 1-13 optionally followed by a or b (e.g., "7", "10b")`
      );
    }
  }

  static create(zone: string | null): GardenHardinessZone {
    return new GardenHardinessZone(zone);
  }

  has_value(): boolean {
    return this.value.length > 0;
  }

  get_zone_number(): number | null {
    if (!this.has_value()) return null;
    const match = this.value.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  get_subzone(): string | null {
    if (!this.has_value()) return null;
    const match = this.value.match(/[a-b]$/);
    return match ? match[0] : null;
  }
}
