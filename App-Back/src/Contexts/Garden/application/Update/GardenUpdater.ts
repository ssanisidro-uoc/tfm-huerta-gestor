import { Garden } from '../../domain/Garden';
import { GardenRepository } from '../../domain/GardenRepository';
import { GardenNotFoundError } from '../../domain/errors/GardenErrors';
import { GardenName } from '../../domain/value-objects/GardenName';
import { GardenClimateZone } from '../../domain/value-objects/GardenClimateZone';
import { GardenSurface } from '../../domain/value-objects/GardenSurface';
import { GardenLocation } from '../../domain/value-objects/GardenLocation';
import { GardenHardinessZone } from '../../domain/value-objects/GardenHardinessZone';
import { NominatimClient } from '../../../Shared/infrastructure/NominatimClient';

interface UpdateLocationData {
  address?: string;
  city: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export class GardenUpdater {
  constructor(
    private repository: GardenRepository,
    private nominatimClient: NominatimClient
  ) {}

  async run(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      climate_zone?: string;
      surface_m2?: number | null;
      hardiness_zone?: string | null;
      location?: UpdateLocationData | null;
      is_active?: boolean;
    }
  ): Promise<Garden> {
    const garden = await this.repository.search_by_id(id);
    
    if (!garden) {
      throw new GardenNotFoundError(id);
    }

    let locationData: UpdateLocationData | undefined;
    
    if (data.location !== undefined) {
      if (data.location) {
        const currentLocation = garden.location;
        
        locationData = {
          address: data.location.address ?? currentLocation.getAddress(),
          city: data.location.city,
          region: data.location.region ?? currentLocation.getRegion(),
          country: data.location.country ?? currentLocation.getCountry(),
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          timezone: data.location.timezone ?? currentLocation.getTimezone()
        };

        if (!locationData.latitude || !locationData.longitude) {
          const geocoded = await this.nominatimClient.geocode(
            locationData.city,
            locationData.region,
            locationData.country || 'Spain'
          );

          if (geocoded) {
            locationData.latitude = geocoded.latitude;
            locationData.longitude = geocoded.longitude;
          } else {
            throw new Error('Ciudad no encontrada. Verifica que el nombre sea correcto.');
          }
        }
      } else {
        locationData = undefined;
      }
    }

    const updatedGarden = garden.update({
      name: data.name ? new GardenName(data.name) : undefined,
      description: data.description,
      climate_zone: data.climate_zone ? new GardenClimateZone(data.climate_zone) : undefined,
      surface_m2: data.surface_m2 !== undefined ? GardenSurface.create(data.surface_m2) : undefined,
      hardiness_zone: data.hardiness_zone !== undefined 
        ? (data.hardiness_zone ? new GardenHardinessZone(data.hardiness_zone) : null)
        : undefined,
      location: locationData !== undefined 
        ? GardenLocation.create(locationData)
        : undefined,
      is_active: data.is_active
    });

    await this.repository.update(updatedGarden);
    return updatedGarden;
  }
}
