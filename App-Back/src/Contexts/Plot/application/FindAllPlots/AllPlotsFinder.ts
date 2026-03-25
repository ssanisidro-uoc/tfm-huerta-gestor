import { Plot } from '../../domain/Plot';
import { PlotRepository } from '../../domain/PlotRepository';

export class AllPlotsFinder {
  constructor(private repository: PlotRepository) {}

  async run(
    garden_id: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ plots: Plot[]; total: number }> {
    const offset = (page - 1) * limit;
    const plots = await this.repository.find_by_garden(garden_id, { page, limit, offset });
    const total = await this.repository.count_by_garden(garden_id);
    return { plots, total };
  }
}
