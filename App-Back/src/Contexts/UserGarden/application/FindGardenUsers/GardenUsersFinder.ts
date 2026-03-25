import { UserGarden } from '../../domain/UserGarden';
import { UserGardenRepository } from '../../domain/UserGardenRepository';

export class GardenUsersFinder {
  constructor(private repository: UserGardenRepository) {}

  async run(garden_id: string): Promise<UserGarden[]> {
    return this.repository.find_by_garden(garden_id);
  }
}
