import { PostgresUserGardenRepository } from '../../../UserGarden/infrastructure/persistence/PostgresUserGardenRepository';

export class CollaboratorUpdater {
  constructor(private userGardenRepository: PostgresUserGardenRepository) {}

  async run(collaboratorId: string, gardenId: string, role: string): Promise<void> {
    const userGarden = await this.userGardenRepository.find_by_user_and_garden(collaboratorId, gardenId);
    if (!userGarden) {
      throw new Error('Collaborator not found in this garden');
    }

    if (userGarden.garden_role === 'owner') {
      throw new Error('Cannot change owner role');
    }

    await this.userGardenRepository.updateRole(collaboratorId, gardenId, role);
  }
}