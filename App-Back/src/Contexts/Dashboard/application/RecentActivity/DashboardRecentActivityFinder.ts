import { PlantingRepository } from '../../../Planting/domain/PlantingRepository';
import { UserGardenRepository } from '../../../Garden/infrastructure/persistence/UserGardenRepository';
import { GardenRepository } from '../../../Garden/domain/GardenRepository';

export interface ActivityItem {
  type: string;
  description: string;
  date: Date;
  related_entity: string;
}

export interface DashboardRecentActivityResponse {
  activities: ActivityItem[];
}

export class DashboardRecentActivityFinder {
  constructor(
    private userGardenRepository: UserGardenRepository,
    private plantingRepository: PlantingRepository,
    private gardenRepository: GardenRepository
  ) {}

  async run(userId: string): Promise<DashboardRecentActivityResponse> {
    const userGardens = await this.userGardenRepository.find_by_user(userId);
    const gardenIds = userGardens.map(ug => ug.garden_id);

    if (gardenIds.length === 0) {
      return { activities: [] };
    }

    const activities: ActivityItem[] = [];
    const now = new Date();

    for (const gardenId of gardenIds) {
      const garden = await this.gardenRepository.search_by_id(gardenId);
      const gardenName = garden?.name.get_value() || 'Huerta';

      const plantings = await this.plantingRepository.search_by_garden(gardenId);
      
      for (const planting of plantings) {
        const daysSincePlanted = Math.floor((now.getTime() - new Date(planting.planted_at).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSincePlanted <= 7 && daysSincePlanted >= 0) {
          activities.push({
            type: 'planting',
            description: `Nueva plantación en ${gardenName}`,
            date: new Date(planting.planted_at),
            related_entity: planting.id.get_value()
          });
        }

        if (planting.harvested_at) {
          const daysSinceHarvested = Math.floor((now.getTime() - new Date(planting.harvested_at).getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceHarvested <= 7) {
            activities.push({
              type: 'harvest',
              description: `Cosecha completada en ${gardenName}`,
              date: new Date(planting.harvested_at),
              related_entity: planting.id.get_value()
            });
          }
        }
      }
    }

    activities.sort((a, b) => b.date.getTime() - a.date.getTime());

    return { activities: activities.slice(0, 10) };
  }
}
