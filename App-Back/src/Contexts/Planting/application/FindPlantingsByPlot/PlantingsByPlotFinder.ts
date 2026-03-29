import { PlantingRepository } from '../../domain/PlantingRepository';
import { CropRepository } from '../../../Crop/domain/CropRepository';
import { PlotRepository } from '../../../Plot/domain/PlotRepository';

export interface PlantingsByPlotFinderResponse {
  plantings: Array<{
    id: string;
    crop_id: string;
    crop_name?: string;
    garden_id: string;
    plot_id: string;
    planted_at: Date;
    expected_harvest_at: Date;
    harvested_at: Date | null;
    quantity: number;
    status: string;
    days_elapsed?: number;
    days_to_harvest?: number;
  }>;
}

export class PlantingsByPlotFinder {
  constructor(
    private plantingRepository: PlantingRepository,
    private cropRepository: CropRepository,
    private plotRepository: PlotRepository
  ) {}

  async run(plotId: string, userId: string): Promise<PlantingsByPlotFinderResponse> {
    const plot = await this.plotRepository.search_by_id(plotId);
    if (!plot) {
      return { plantings: [] };
    }

    const plantings = await this.plantingRepository.search_by_plot(plotId);
    
    const now = new Date();
    const result = [];
    
    for (const p of plantings) {
      const plantedAt = new Date(p.planted_at);
      const expectedHarvest = new Date(p.expected_harvest_at);
      const daysElapsed = Math.floor((now.getTime() - plantedAt.getTime()) / (1000 * 60 * 60 * 24));
      const daysToHarvest = Math.floor((expectedHarvest.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let cropName: string | undefined;
      try {
        const crop = await this.cropRepository.search_by_id(p.crop_id.get_value());
        cropName = crop?.to_persistence().common_name;
      } catch (e) {
        // Crop not found
      }
      
      result.push({
        id: p.id.get_value(),
        crop_id: p.crop_id.get_value(),
        crop_name: cropName,
        garden_id: p.garden_id.get_value(),
        plot_id: p.plot_id,
        planted_at: p.planted_at,
        expected_harvest_at: p.expected_harvest_at,
        harvested_at: p.harvested_at,
        quantity: p.quantity,
        status: p.is_active ? 'growing' : 'harvested',
        days_elapsed: daysElapsed,
        days_to_harvest: daysToHarvest > 0 ? daysToHarvest : 0
      });
    }

    return { plantings: result };
  }
}
