import { UserGardenRepository } from '../../domain/UserGardenRepository';
import { CheckGardenAccessResponse } from './CheckGardenAccessResponse';

export class CheckGardenAccessFinder {
  constructor(private userGardenRepository: UserGardenRepository) {}

  async run(userId: string, gardenId: string, requiredRole: string): Promise<CheckGardenAccessResponse> {
    const hasAccess = await this.userGardenRepository.has_permission(userId, gardenId, requiredRole);
    
    if (hasAccess) {
      return new CheckGardenAccessResponse(true, requiredRole);
    }

    const userGarden = await this.userGardenRepository.find_by_user_and_garden(userId, gardenId);
    
    if (userGarden) {
      return new CheckGardenAccessResponse(true, userGarden.garden_role);
    }

    return new CheckGardenAccessResponse(false, null);
  }
}
