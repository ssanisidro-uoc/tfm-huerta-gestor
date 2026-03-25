import { Planting } from '../../domain/Planting';
import { PlantingRepository } from '../../domain/PlantingRepository';

export class PlantingByIdFinder {
  constructor(private repository: PlantingRepository) {}

  async run(id: string): Promise<Planting | null> {
    return this.repository.search_by_id(id);
  }
}
