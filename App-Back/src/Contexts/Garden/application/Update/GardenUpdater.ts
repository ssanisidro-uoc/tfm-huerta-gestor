import { Garden } from '../../domain/Garden';
import { GardenRepository } from '../../domain/GardenRepository';
import { GardenNotFoundError } from '../../domain/errors/GardenErrors';
import { GardenName } from '../../domain/value-objects/GardenName';
import { GardenClimateZone } from '../../domain/value-objects/GardenClimateZone';
import { GardenSurface } from '../../domain/value-objects/GardenSurface';
import { GardenLocation } from '../../domain/value-objects/GardenLocation';
import { GardenHardinessZone } from '../../domain/value-objects/GardenHardinessZone';

export class GardenUpdater {
  constructor(private repository: GardenRepository) {}

  async run(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      climate_zone?: string;
      surface_m2?: number | null;
      hardiness_zone?: string | null;
      location?: {
        address?: string;
        city?: string;
        region?: string;
        country?: string;
        latitude?: number;
        longitude?: number;
        timezone?: string;
      } | null;
      is_active?: boolean;
    }
  ): Promise<Garden> {
    const garden = await this.repository.search_by_id(id);
    
    if (!garden) {
      throw new GardenNotFoundError(id);
    }

    const updatedGarden = garden.update({
      name: data.name ? new GardenName(data.name) : undefined,
      description: data.description,
      climate_zone: data.climate_zone ? new GardenClimateZone(data.climate_zone) : undefined,
      surface_m2: data.surface_m2 !== undefined ? GardenSurface.create(data.surface_m2) : undefined,
      hardiness_zone: data.hardiness_zone !== undefined 
        ? (data.hardiness_zone ? new GardenHardinessZone(data.hardiness_zone) : null)
        : undefined,
      location: data.location !== undefined 
        ? (data.location ? GardenLocation.create(data.location) : undefined)
        : undefined,
      is_active: data.is_active
    });

    await this.repository.update(updatedGarden);
    return updatedGarden;
  }
}
