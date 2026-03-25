import { UserGarden, GardenRole } from '../../domain/UserGarden';
import { UserGardenId } from '../../domain/value-objects/UserGardenId';
import { UserGardenRepository } from '../../domain/UserGardenRepository';

export class GrantGardenAccessCreator {
  constructor(private repository: UserGardenRepository) {}

  async run(
    id: string,
    user_id: string,
    garden_id: string,
    garden_role: string,
    invited_by: string | null
  ): Promise<UserGarden> {
    const existing = await this.repository.find_by_user_and_garden(user_id, garden_id);
    if (existing) {
      throw new Error(`User ${user_id} already has access to garden ${garden_id}`);
    }

    const userGarden = UserGarden.create({
      id: new UserGardenId(id),
      user_id_value: user_id,
      garden_id_value: garden_id,
      garden_role: garden_role as GardenRole,
      invited_by: invited_by || null
    });

    await this.repository.save(userGarden);
    return userGarden;
  }
}
