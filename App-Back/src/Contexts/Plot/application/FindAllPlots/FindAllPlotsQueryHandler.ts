import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindAllPlotsQuery } from './FindAllPlotsQuery';
import { FindAllPlotsResponse } from './FindAllPlotsResponse';
import { AllPlotsFinder } from './AllPlotsFinder';
import { PlantingRepository } from '../../../Planting/domain/PlantingRepository';
import { CropRepository } from '../../../Crop/domain/CropRepository';

export class FindAllPlotsQueryHandler implements QueryHandler<FindAllPlotsQuery, FindAllPlotsResponse> {
  constructor(
    private finder: AllPlotsFinder,
    private plantingRepository: PlantingRepository,
    private cropRepository: CropRepository
  ) {}

  subscribedTo(): Query {
    return FindAllPlotsQuery;
  }

  async handle(query: FindAllPlotsQuery): Promise<FindAllPlotsResponse> {
    const { plots, total } = await this.finder.run(query.garden_id, query.page, query.limit);
    
    const plotsWithPlantings = await Promise.all(
      plots.map(async (plot) => {
        const plantings = await this.plantingRepository.search_active_by_plot(plot.id.get_value());
        
        const today = new Date();
        const plantingsData = await Promise.all(
          plantings.map(async (planting) => {
            const crop = await this.cropRepository.search_by_id(planting.crop_id.get_value());
            const status = planting.status as any;
            
            // Calculate growth_percentage based on planting dates
            const plantedAt = new Date(planting.planted_at);
            const expectedHarvest = new Date(planting.expected_harvest_at);
            const totalDays = Math.ceil((expectedHarvest.getTime() - plantedAt.getTime()) / (1000 * 60 * 60 * 24));
            const daysElapsed = Math.ceil((today.getTime() - plantedAt.getTime()) / (1000 * 60 * 60 * 24));
            const growthPercentage = totalDays > 0 ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : 0;

            return {
              id: planting.id.get_value(),
              crop_id: planting.crop_id.get_value(),
              name: crop ? (crop.name as any)?.value || 'Unknown' : 'Unknown',
              growth_percentage: growthPercentage,
              planted_at: plantedAt.toISOString(),
              status: status?.valueOf?.() || 'active'
            };
          })
        );

        return {
          id: plot.id.get_value(),
          garden_id: plot.garden_id.get_value(),
          name: plot.name.get_value(),
          code: plot.code,
          description: plot.description,
          surface_m2: plot.surface.to_persistence(),
          is_active: plot.is_active,
          crops: plantingsData as any
        };
      })
    );
    
    return new FindAllPlotsResponse(
      plotsWithPlantings,
      total,
      query.page,
      query.limit
    );
  }
}
