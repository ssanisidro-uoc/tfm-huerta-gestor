import { CropRepository } from '../../../Crop/domain/CropRepository';
import { UserGardenRepository } from '../../../Garden/infrastructure/persistence/UserGardenRepository';
import { PlantingRepository } from '../../../Planting/domain/PlantingRepository';
import { PlotRepository } from '../../../Plot/domain/PlotRepository';

export interface CropSummary {
  id: string;
  name: string;
  plot_id: string;
  plot_name: string;
  planted_at: Date;
  expected_harvest: Date;
  days_to_harvest: number;
  status: string;
  growth_percentage: number;
}

export interface DashboardCropsSummaryResponse {
  crops: CropSummary[];
}

export class DashboardCropsSummaryFinder {
  constructor(
    private userGardenRepository: UserGardenRepository,
    private plantingRepository: PlantingRepository,
    private cropRepository: CropRepository,
    private plotRepository: PlotRepository
  ) {}

  async run(userId: string): Promise<DashboardCropsSummaryResponse> {
    const userGardens = await this.userGardenRepository.find_by_user(userId);
    const gardenIds = userGardens.map((ug) => ug.garden_id);

    if (gardenIds.length === 0) {
      return { crops: [] };
    }

    const crops: CropSummary[] = [];
    const today = new Date();

    for (const gardenId of gardenIds) {
      const plantings = await this.plantingRepository.search_active_by_garden(gardenId);

      for (const planting of plantings) {
        const crop = await this.cropRepository.search_by_id(planting.crop_id.get_value());
        const plot = await this.plotRepository.search_by_id(planting.plot_id);

        const harvestDate = new Date(planting.expected_harvest_at);
        const plantedAt = new Date(planting.planted_at);
        const daysToHarvest = Math.max(
          0,
          Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        );
        const totalDays = Math.ceil(
          (harvestDate.getTime() - plantedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        const daysElapsed = Math.ceil(
          (today.getTime() - plantedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        const growthPercentage =
          totalDays > 0 ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : 0;

        let status = 'active';
        if (harvestDate < today) {
          status = 'ready';
        }

        crops.push({
          id: planting.id.get_value(),
          name: crop?.name.get_value() || 'Unknown',
          plot_id: planting.plot_id,
          plot_name: plot?.name.get_value() || 'Unknown',
          planted_at: planting.planted_at,
          expected_harvest: planting.expected_harvest_at,
          days_to_harvest: daysToHarvest,
          status,
          growth_percentage: growthPercentage
        });
      }
    }

    return { crops };
  }
}
