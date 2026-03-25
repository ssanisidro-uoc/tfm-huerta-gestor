import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindUserGardensQuery } from './FindUserGardensQuery';
import { FindUserGardensResponse } from './FindUserGardensResponse';
import { UserGardensFinder } from './UserGardensFinder';

export class FindUserGardensQueryHandler implements QueryHandler<FindUserGardensQuery, FindUserGardensResponse> {
  constructor(private finder: UserGardensFinder) {}

  subscribedTo(): Query {
    return FindUserGardensQuery;
  }

  async handle(query: FindUserGardensQuery): Promise<FindUserGardensResponse> {
    const userGardens = await this.finder.run(query.user_id);
    
    return new FindUserGardensResponse(
      userGardens.map(ug => ({
        id: ug.id.get_value(),
        garden_id: ug.garden_id,
        garden_role: ug.garden_role,
        created_at: ug.created_at
      }))
    );
  }
}
