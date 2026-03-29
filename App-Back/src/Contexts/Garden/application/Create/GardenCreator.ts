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

interface CreateGardenData {
  id: string;
  owner_id: string;
  name: string;
  description?: string | null;
  surface_m2?: number | null;
  climate_zone: string;
  hardiness_zone?: string | null;
  location?: {
    address?: string;
    city?: string;
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
    private userGardenRepository: UserGardenRepository
  ) {}

  async run(data: CreateGardenData): Promise<Garden> {
    const garden = Garden.create({
      id: new GardenId(data.id),
      owner_id: new UserId(data.owner_id),
      name: new GardenName(data.name),
      description: data.description ?? null,
      surface_m2: data.surface_m2 !== undefined ? GardenSurface.create(data.surface_m2) : GardenSurface.create(null),
      climate_zone: new GardenClimateZone(data.climate_zone),
      hardiness_zone: data.hardiness_zone ? new GardenHardinessZone(data.hardiness_zone) : null,
      location: data.location ? GardenLocation.create(data.location) : undefined
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
