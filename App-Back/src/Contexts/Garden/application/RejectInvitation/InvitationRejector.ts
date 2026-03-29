import { UserGardenRepository } from '../../../UserGarden/domain/UserGardenRepository';

export class InvitationRejector {
  constructor(private userGardenRepository: UserGardenRepository) {}

  async run(gardenId: string, userId: string): Promise<void> {
    const userGarden = await this.userGardenRepository.find_by_user_and_garden(userId, gardenId);

    if (!userGarden) {
      throw new Error('INVITATION_NOT_FOUND');
    }

    await this.userGardenRepository.delete_by_user_and_garden(userId, gardenId);
  }
}
