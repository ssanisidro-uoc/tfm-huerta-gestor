import { GardenRepository } from '../../domain/GardenRepository';
import { GardenNotFoundError } from '../../domain/errors/GardenErrors';

export class GardenDeleter {
  constructor(private repository: GardenRepository) {}

  async run(id: string): Promise<void> {
    const garden = await this.repository.search_by_id(id);
    
    if (!garden) {
      throw new GardenNotFoundError(id);
    }

    await this.repository.delete(id);
  }
}
