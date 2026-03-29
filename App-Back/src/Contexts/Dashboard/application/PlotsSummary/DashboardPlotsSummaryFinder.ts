import { UserGardenRepository } from '../../../Garden/infrastructure/persistence/UserGardenRepository';
import { PlotRepository } from '../../../Plot/domain/PlotRepository';
import { GardenRepository } from '../../../Garden/domain/GardenRepository';

export interface PlotSummary {
  id: string;
  name: string;
  garden_id: string;
  garden_name: string;
  is_active: boolean;
  surface_m2: number;
  last_activity: Date | null;
}

export interface DashboardPlotsSummaryResponse {
  plots: PlotSummary[];
}

export class DashboardPlotsSummaryFinder {
  constructor(
    private userGardenRepository: UserGardenRepository,
    private plotRepository: PlotRepository,
    private gardenRepository: GardenRepository
  ) {}

  async run(userId: string): Promise<DashboardPlotsSummaryResponse> {
    const userGardens = await this.userGardenRepository.find_by_user(userId);
    const gardenIds = userGardens.map(ug => ug.garden_id);

    if (gardenIds.length === 0) {
      return { plots: [] };
    }

    const plots: PlotSummary[] = [];
    for (const gardenId of gardenIds) {
      const garden = await this.gardenRepository.search_by_id(gardenId);
      const gardenPlots = await this.plotRepository.find_by_garden(gardenId);

      for (const plot of gardenPlots) {
        plots.push({
          id: plot.id.get_value(),
          name: plot.name.get_value(),
          garden_id: plot.garden_id.get_value(),
          garden_name: garden?.name.get_value() || 'Unknown',
          is_active: plot.is_active,
          surface_m2: plot.surface.to_persistence(),
          last_activity: plot.updated_at
        });
      }
    }

    return { plots };
  }
}
