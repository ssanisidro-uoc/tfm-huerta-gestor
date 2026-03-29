import { PlantingRepository } from '../../domain/PlantingRepository';
import { UserGardenRepository } from '../../../Garden/infrastructure/persistence/UserGardenRepository';

export interface PlantingsFinderResponse {
  plantings: Array<{
    id: string;
    crop_id: string;
    garden_id: string;
    plot_id: string;
    planted_at: Date;
    expected_harvest_at: Date;
    harvested_at: Date | null;
    quantity: number;
    status: string;
  }>;
}

export class PlantingsFinder {
  constructor(
    private plantingRepository: PlantingRepository,
    private userGardenRepository: UserGardenRepository
  ) {}

  async run(userId: string): Promise<PlantingsFinderResponse> {
    const userGardens = await this.userGardenRepository.find_by_user(userId);
    const gardenIds = userGardens.map(ug => ug.garden_id);

    if (gardenIds.length === 0) {
      return { plantings: [] };
    }

    const plantings = [];
    for (const gardenId of gardenIds) {
      const gardenPlantings = await this.plantingRepository.search_by_garden(gardenId);
      for (const p of gardenPlantings) {
        plantings.push({
          id: p.id.get_value(),
          crop_id: p.crop_id.get_value(),
          garden_id: p.garden_id.get_value(),
          plot_id: p.plot_id,
          planted_at: p.planted_at,
          expected_harvest_at: p.expected_harvest_at,
          harvested_at: p.harvested_at,
          quantity: p.quantity,
          status: p.is_active ? 'growing' : 'harvested'
        });
      }
    }

    return { plantings };
  }
}
