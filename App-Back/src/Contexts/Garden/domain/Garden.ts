import { AggregateRoot } from '../../Shared/domain/AggregateRoot';
import { UserId } from '../../User/domain/UserId';
import { GardenId } from './value-objects/GardenId';
import { GardenName } from './value-objects/GardenName';
import { GardenClimateZone } from './value-objects/GardenClimateZone';
import { GardenHardinessZone } from './value-objects/GardenHardinessZone';
import { GardenLocation } from './value-objects/GardenLocation';
import { GardenSurface } from './value-objects/GardenSurface';

interface GardenProps {
  id: GardenId;
  owner_id: UserId;
  name: GardenName;
  description: string | null;
  location: GardenLocation;
  surface_m2: GardenSurface;
  climate_zone: GardenClimateZone;
  hardiness_zone: GardenHardinessZone | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class Garden extends AggregateRoot {
  readonly id: GardenId;
  readonly owner_id: UserId;
  readonly name: GardenName;
  readonly description: string | null;
  readonly location: GardenLocation;
  readonly surface_m2: GardenSurface;
  readonly climate_zone: GardenClimateZone;
  readonly hardiness_zone: GardenHardinessZone | null;
  readonly is_active: boolean;
  readonly created_at: Date;
  readonly updated_at: Date;

  constructor(props: GardenProps) {
    super();
    this.id = props.id;
    this.owner_id = props.owner_id;
    this.name = props.name;
    this.description = props.description;
    this.location = props.location;
    this.surface_m2 = props.surface_m2;
    this.climate_zone = props.climate_zone;
    this.hardiness_zone = props.hardiness_zone;
    this.is_active = props.is_active;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
  }

  static create(data: {
    id: GardenId;
    owner_id: UserId;
    name: GardenName;
    description?: string | null;
    location?: GardenLocation;
    surface_m2?: GardenSurface;
    climate_zone: GardenClimateZone;
    hardiness_zone?: GardenHardinessZone | null;
  }): Garden {
    const now = new Date();
    return new Garden({
      id: data.id,
      owner_id: data.owner_id,
      name: data.name,
      description: data.description ?? null,
      location: data.location ?? GardenLocation.create({}),
      surface_m2: data.surface_m2 ?? GardenSurface.create(null),
      climate_zone: data.climate_zone,
      hardiness_zone: data.hardiness_zone ?? null,
      is_active: true,
      created_at: now,
      updated_at: now
    });
  }

  static from_persistence(raw: {
    id: string;
    owner_id: string;
    name: string;
    description: string | null;
    location_address: string | null;
    location_city: string | null;
    location_region: string | null;
    location_country: string;
    location_latitude: number | null;
    location_longitude: number | null;
    location_timezone: string;
    surface_m2: number | null;
    climate_zone: string;
    hardiness_zone: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }): Garden {
    return new Garden({
      id: new GardenId(raw.id),
      owner_id: new UserId(raw.owner_id),
      name: new GardenName(raw.name),
      description: raw.description,
      location: GardenLocation.from_persistence({
        location_address: raw.location_address,
        location_city: raw.location_city,
        location_region: raw.location_region,
        location_country: raw.location_country,
        location_latitude: raw.location_latitude,
        location_longitude: raw.location_longitude,
        location_timezone: raw.location_timezone
      }),
      surface_m2: GardenSurface.from_persistence(raw.surface_m2),
      climate_zone: new GardenClimateZone(raw.climate_zone),
      hardiness_zone: raw.hardiness_zone ? new GardenHardinessZone(raw.hardiness_zone) : null,
      is_active: raw.is_active,
      created_at: new Date(raw.created_at),
      updated_at: new Date(raw.updated_at)
    });
  }

  to_persistence(): {
    id: string;
    owner_id: string;
    name: string;
    description: string | null;
    location_address: string | null;
    location_city: string | null;
    location_region: string | null;
    location_country: string;
    location_latitude: number | null;
    location_longitude: number | null;
    location_timezone: string;
    surface_m2: number | null;
    climate_zone: string;
    hardiness_zone: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  } {
    const locationData = this.location.to_persistence();
    return {
      id: this.id.get_value(),
      owner_id: this.owner_id.get_value(),
      name: this.name.get_value(),
      description: this.description,
      location_address: locationData.location_address,
      location_city: locationData.location_city,
      location_region: locationData.location_region,
      location_country: locationData.location_country,
      location_latitude: locationData.location_latitude,
      location_longitude: locationData.location_longitude,
      location_timezone: locationData.location_timezone,
      surface_m2: this.surface_m2.to_persistence(),
      climate_zone: this.climate_zone.get_value(),
      hardiness_zone: this.hardiness_zone?.get_value() ?? null,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  update(data: Partial<{
    name: GardenName;
    description: string | null;
    location: GardenLocation;
    surface_m2: GardenSurface;
    climate_zone: GardenClimateZone;
    hardiness_zone: GardenHardinessZone | null;
    is_active: boolean;
  }>): Garden {
    return new Garden({
      id: this.id,
      owner_id: this.owner_id,
      name: data.name ?? this.name,
      description: data.description !== undefined ? data.description : this.description,
      location: data.location ?? this.location,
      surface_m2: data.surface_m2 ?? this.surface_m2,
      climate_zone: data.climate_zone ?? this.climate_zone,
      hardiness_zone: data.hardiness_zone !== undefined ? data.hardiness_zone : this.hardiness_zone,
      is_active: data.is_active ?? this.is_active,
      created_at: this.created_at,
      updated_at: new Date()
    });
  }
}
