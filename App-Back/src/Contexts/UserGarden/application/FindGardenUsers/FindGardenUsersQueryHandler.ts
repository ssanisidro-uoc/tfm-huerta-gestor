import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindGardenUsersQuery } from './FindGardenUsersQuery';
import { FindGardenUsersResponse } from './FindGardenUsersResponse';
import { GardenUsersFinder } from './GardenUsersFinder';

export class FindGardenUsersQueryHandler implements QueryHandler<FindGardenUsersQuery, FindGardenUsersResponse> {
  constructor(private finder: GardenUsersFinder) {}

  subscribedTo(): Query {
    return FindGardenUsersQuery;
  }

  async handle(query: FindGardenUsersQuery): Promise<FindGardenUsersResponse> {
    const gardenUsers = await this.finder.run(query.garden_id);
    
    return new FindGardenUsersResponse(
      gardenUsers.map(ug => ({
        id: ug.id.get_value(),
        user_id: ug.user_id,
        garden_role: ug.garden_role,
        created_at: ug.created_at
      }))
    );
  }
}
