import { PlotRepository } from '../../domain/PlotRepository';
import { PlotNotFoundError } from '../../domain/errors/PlotErrors';

export class PlotDeleter {
  constructor(private repository: PlotRepository) {}

  async run(id: string): Promise<void> {
    const plot = await this.repository.search_by_id(id);
    
    if (!plot) {
      throw new PlotNotFoundError(id);
    }

    await this.repository.delete(id);
  }
}