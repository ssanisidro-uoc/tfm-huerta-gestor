import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { ListSharedGardensQuery } from './ListSharedGardensQuery';
import { UserGardenRepository } from '../../infrastructure/persistence/UserGardenRepository';
import { PostgresGardenRepository } from '../../infrastructure/persistence/PostgresGardenRepository';

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

export class ListSharedGardensQueryHandler implements QueryHandler<ListSharedGardensQuery, SharedGardenResponse[]> {
  constructor(
    private userGardenRepository: UserGardenRepository,
    private gardenRepository: PostgresGardenRepository
  ) {}

  subscribedTo(): Query {
    return ListSharedGardensQuery;
  }

  async handle(query: ListSharedGardensQuery): Promise<SharedGardenResponse[]> {
    const userGardens = await this.userGardenRepository.find_by_user(query.user_id);

    const gardens = await Promise.all(
      userGardens.map(async (ug) => {
        const garden = await this.gardenRepository.search_by_id(ug.garden_id);
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
