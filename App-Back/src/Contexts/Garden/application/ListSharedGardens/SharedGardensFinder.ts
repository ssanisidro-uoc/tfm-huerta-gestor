import { UserGardenRepository } from '../../infrastructure/persistence/UserGardenRepository';
import { GardenByIdFinder } from '../FindGardenById/GardenByIdFinder';

export interface SharedGardenResponse {
  garden_id: string;
  garden_role: string;
  invitation_accepted: boolean;
  invitation_accepted_at: Date | null;
  created_at: Date;
  garden: {
    id: string;
    name: string;
    climate_zone: string;
    location: any;
  } | null;
}

export class SharedGardensFinder {
  constructor(
    private userGardenRepository: UserGardenRepository,
    private gardenFinder: GardenByIdFinder
  ) {}

  async run(userId: string): Promise<SharedGardenResponse[]> {
    const userGardens = await this.userGardenRepository.find_by_user(userId);

    const gardens = await Promise.all(
      userGardens.map(async (ug) => {
        const garden = await this.gardenFinder.run(ug.garden_id);
        return {
          garden_id: ug.garden_id,
          garden_role: ug.garden_role,
          invitation_accepted: ug.invitation_accepted_at !== null,
          invitation_accepted_at: ug.invitation_accepted_at,
          created_at: ug.created_at,
          garden: garden ? {
            id: garden.id.get_value(),
            name: garden.name.get_value(),
            climate_zone: garden.climate_zone.get_value(),
            location: garden.location.to_persistence()
          } : null
        };
      })
    );

    return gardens;
  }
}