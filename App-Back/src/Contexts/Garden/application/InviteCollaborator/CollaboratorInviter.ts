import { UserGardenRepository } from '../../infrastructure/persistence/UserGardenRepository';
import { PostgresUserRepository } from '../../../User/infrastructure/persistence/PostgresUserRepository';

export class CollaboratorInviter {
  constructor(
    private userGardenRepository: UserGardenRepository,
    private userRepository: PostgresUserRepository
  ) {}

  async run(gardenId: string, email: string, role: string, invitedBy: string): Promise<void> {
    const user = await this.userRepository.find_by_email(email);
    
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const existing = await this.userGardenRepository.find_by_user_and_garden(
      user.id.get_value(),
      gardenId
    );

    if (existing) {
      throw new Error('USER_ALREADY_HAS_ACCESS');
    }

    await this.userGardenRepository.create({
      user_id: user.id.get_value(),
      garden_id: gardenId,
      garden_role: role,
      invited_by: invitedBy,
      invitation_accepted_at: null
    });
  }
}
