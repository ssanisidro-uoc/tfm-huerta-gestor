import { UserGardenRepository } from '../../infrastructure/persistence/UserGardenRepository';

export class InvitationAcceptor {
  constructor(private userGardenRepository: UserGardenRepository) {}

  async run(gardenId: string, userId: string): Promise<void> {
    const userGarden = await this.userGardenRepository.find_by_user_and_garden(userId, gardenId);

    if (!userGarden) {
      throw new Error('INVITATION_NOT_FOUND');
    }

    if (userGarden.invitation_accepted_at) {
      throw new Error('INVITATION_ALREADY_ACCEPTED');
    }

    await this.userGardenRepository.accept_invitation(userId, gardenId);
  }
}
