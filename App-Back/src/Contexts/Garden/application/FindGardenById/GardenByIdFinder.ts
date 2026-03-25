import { Garden } from '../../domain/Garden';
import { GardenRepository } from '../../domain/GardenRepository';

export class GardenByIdFinder {
  constructor(private repository: GardenRepository) {}

  async run(id: string): Promise<Garden | null> {
    return this.repository.search_by_id(id);
  }
}
