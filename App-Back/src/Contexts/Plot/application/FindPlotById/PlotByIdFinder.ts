import { Plot } from '../../domain/Plot';
import { PlotRepository } from '../../domain/PlotRepository';

export class PlotByIdFinder {
  constructor(private repository: PlotRepository) {}

  async run(id: string): Promise<Plot | null> {
    return this.repository.search_by_id(id);
  }
}
