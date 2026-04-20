import { PlotRepository } from '../../domain/PlotRepository';
import { GardenRepository } from '../../../Garden/domain/GardenRepository';
import { UserGardenRepository } from '../../../UserGarden/domain/UserGardenRepository';
import { RotationPlanRepository } from '../../infrastructure/persistence/PostgresRotationPlanRepository';
import { PlotRotationHistoryResponse } from './PlotRotationHistoryResponse';

export class PlotRotationHistoryFinder {
  constructor(
    private plotRepository: PlotRepository,
    private gardenRepository: GardenRepository,
    private userGardenRepository: UserGardenRepository,
    private rotationPlanRepository: RotationPlanRepository
  ) {}

  async run(plotId: string, userId: string): Promise<PlotRotationHistoryResponse> {
    const plot = await this.plotRepository.search_by_id(plotId);
    if (!plot) {
      throw new Error('Plot not found');
    }

    const hasAccess = await this.userGardenRepository.has_permission(userId, plot.garden_id.get_value(), 'viewer');
    if (!hasAccess) {
      throw new Error('Access denied to this garden');
    }

    const garden = await this.gardenRepository.search_by_id(plot.garden_id.get_value());
    const gardenName = garden?.name.get_value() || 'Huerta';

    const rotationRows = await this.rotationPlanRepository.findByPlotId(plotId);

    const rotations = rotationRows.map(row => ({
      year: row.rotation_cycle_year,
      sequence: row.sequence_order,
      crop_name: row.crop_name || 'Sin cultivo',
      planting_date: row.actual_planting_date || row.planned_planting_date,
      harvest_date: row.harvested_at || row.expected_harvest_at || row.expected_harvest_date,
      yield_kg: row.total_harvest_kg,
      rotation_score: row.rotation_score,
      status: row.plan_status
    }));

    return {
      plot_id: plot.id.get_value(),
      plot_name: plot.name.get_value(),
      garden_name: gardenName,
      rotations
    };
  }
}