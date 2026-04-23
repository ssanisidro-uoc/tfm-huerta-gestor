import { Garden } from '../../domain/Garden';
import { GardenId } from '../../domain/value-objects/GardenId';
import { GardenName } from '../../domain/value-objects/GardenName';
import { GardenClimateZone } from '../../domain/value-objects/GardenClimateZone';
import { GardenSurface } from '../../domain/value-objects/GardenSurface';
import { GardenLocation } from '../../domain/value-objects/GardenLocation';
import { GardenHardinessZone } from '../../domain/value-objects/GardenHardinessZone';
import { GardenRepository } from '../../domain/GardenRepository';
import { UserGardenRepository } from '../../../UserGarden/domain/UserGardenRepository';
import { UserId } from '../../../User/domain/UserId';
import { NominatimClient } from '../../../Shared/infrastructure/NominatimClient';

interface CreateGardenData {
  id: string;
  owner_id: string;
  name: string;
  description?: string | null;
  surface_m2?: number | null;
  climate_zone: string;
  hardiness_zone?: string | null;
  location: {
    address?: string;
    city: string;
    region?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
}

export class GardenCreator {
  constructor(
    private repository: GardenRepository,
    private userGardenRepository: UserGardenRepository,
    private nominatimClient: NominatimClient
  ) {}

  async run(data: CreateGardenData): Promise<Garden> {
    let locationData = data.location;

    console.log('[GardenCreator] Received location:', JSON.stringify(locationData));

    const hasCoords = locationData.latitude !== undefined && locationData.latitude !== null &&
                     locationData.longitude !== undefined && locationData.longitude !== null;

    if (!hasCoords) {
      console.log('[GardenCreator] Missing coordinates, trying to geocode...');
      const geocoded = await this.nominatimClient.geocode(
        locationData.city,
        locationData.region,
        locationData.country || 'Spain'
      );

      if (geocoded) {
        locationData = {
          ...locationData,
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
          city: geocoded.city || locationData.city
        };
        console.log('[GardenCreator] After geocoding:', JSON.stringify(locationData));
      }
    } else {
      console.log('[GardenCreator] Coordinates OK, using received ones');
    }

    console.log('[GardenCreator] Final locationData:', JSON.stringify(locationData));

    const garden = Garden.create({
      id: new GardenId(data.id),
      owner_id: new UserId(data.owner_id),
      name: new GardenName(data.name),
      description: data.description ?? null,
      surface_m2: data.surface_m2 !== undefined ? GardenSurface.create(data.surface_m2) : GardenSurface.create(null),
      climate_zone: new GardenClimateZone(data.climate_zone),
      hardiness_zone: data.hardiness_zone ? new GardenHardinessZone(data.hardiness_zone) : null,
      location: GardenLocation.create(locationData)
    });

    await this.repository.save(garden);

    await this.userGardenRepository.create({
      user_id: data.owner_id,
      garden_id: data.id,
      garden_role: 'owner',
      invited_by: data.owner_id,
      invitation_accepted_at: new Date()
    });

    return garden;
  }
}