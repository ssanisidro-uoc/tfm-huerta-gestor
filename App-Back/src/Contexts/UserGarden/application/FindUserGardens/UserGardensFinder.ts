import { UserGarden } from '../../domain/UserGarden';
import { UserGardenRepository } from '../../domain/UserGardenRepository';

export class UserGardensFinder {
  constructor(private repository: UserGardenRepository) {}

  async run(user_id: string): Promise<UserGarden[]> {
    return this.repository.find_by_user(user_id);
  }
}
