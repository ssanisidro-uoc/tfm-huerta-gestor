import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';
import { InvalidArgumentError } from '../../../Shared/domain/InvalidArgumentError';
import { InvalidGardenCountryCodeError } from '../errors/GardenErrors';

interface GardenLocationProps {
  address?: string;
  city?: string;
  region?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
}

export class GardenLocation extends ValueObject<GardenLocationProps> {
  private static readonly VALID_COUNTRIES = ['ES', 'PT', 'FR', 'IT', 'MA', 'AR', 'CL', 'MX', 'CO', 'PE', 'UY'];
  private static readonly DEFAULT_COUNTRY = 'ES';
  private static readonly DEFAULT_TIMEZONE = 'Europe/Madrid';

  constructor(props: GardenLocationProps) {
    super(props);
    this.validate(props);
  }

  private validate(props: GardenLocationProps): void {
    if (props.country && !GardenLocation.VALID_COUNTRIES.includes(props.country)) {
      throw new InvalidGardenCountryCodeError(props.country);
    }

    if (props.latitude !== undefined && (props.latitude < -90 || props.latitude > 90)) {
      throw new InvalidArgumentError(`Latitude must be between -90 and 90, got: ${props.latitude}`, { field: 'latitude', value: props.latitude });
    }

    if (props.longitude !== undefined && (props.longitude < -180 || props.longitude > 180)) {
      throw new InvalidArgumentError(`Longitude must be between -180 and 180, got: ${props.longitude}`, { field: 'longitude', value: props.longitude });
    }

    if (props.latitude !== undefined && props.longitude === undefined) {
      throw new InvalidArgumentError('If latitude is provided, longitude must also be provided', { field: 'location' });
    }

    if (props.latitude === undefined && props.longitude !== undefined) {
      throw new InvalidArgumentError('If longitude is provided, latitude must also be provided', { field: 'location' });
    }
  }

  static create(props: Partial<GardenLocationProps>): GardenLocation {
    return new GardenLocation({
      address: props.address,
      city: props.city,
      region: props.region,
      country: props.country || GardenLocation.DEFAULT_COUNTRY,
      latitude: props.latitude,
      longitude: props.longitude,
      timezone: props.timezone || GardenLocation.DEFAULT_TIMEZONE
    });
  }

  static from_persistence(raw: {
    location_address?: string | null;
    location_city?: string | null;
    location_region?: string | null;
    location_country?: string | null;
    location_latitude?: number | null;
    location_longitude?: number | null;
    location_timezone?: string | null;
  }): GardenLocation {
    return new GardenLocation({
      address: raw.location_address ?? undefined,
      city: raw.location_city ?? undefined,
      region: raw.location_region ?? undefined,
      country: raw.location_country ?? GardenLocation.DEFAULT_COUNTRY,
      latitude: raw.location_latitude ?? undefined,
      longitude: raw.location_longitude ?? undefined,
      timezone: raw.location_timezone ?? GardenLocation.DEFAULT_TIMEZONE
    });
  }

  has_coordinates(): boolean {
    return this.value.latitude !== undefined && this.value.longitude !== undefined;
  }

  has_address(): boolean {
    return !!this.value.address || !!this.value.city || !!this.value.region;
  }

  get_address_string(): string {
    const parts = [
      this.value.address,
      this.value.city,
      this.value.region,
      this.value.country
    ].filter(Boolean);
    return parts.join(', ');
  }

  to_persistence(): {
    location_address: string | null;
    location_city: string | null;
    location_region: string | null;
    location_country: string;
    location_latitude: number | null;
    location_longitude: number | null;
    location_timezone: string;
  } {
    return {
      location_address: this.value.address || null,
      location_city: this.value.city || null,
      location_region: this.value.region || null,
      location_country: this.value.country,
      location_latitude: this.value.latitude || null,
      location_longitude: this.value.longitude || null,
      location_timezone: this.value.timezone
    };
  }
}
