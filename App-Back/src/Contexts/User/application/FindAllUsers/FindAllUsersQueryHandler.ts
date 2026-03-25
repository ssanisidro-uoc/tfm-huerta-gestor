import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindAllUsersQuery } from './FindAllUsersQuery';
import { FindAllUsersResponse } from './FindAllUsersResponse';
import { AllUsersFinder } from './AllUsersFinder';

export class FindAllUsersQueryHandler implements QueryHandler<FindAllUsersQuery, FindAllUsersResponse> {
  constructor(private finder: AllUsersFinder) {}

  subscribedTo(): Query {
    return FindAllUsersQuery;
  }

  async handle(query: FindAllUsersQuery): Promise<FindAllUsersResponse> {
    const { users, total } = await this.finder.run(query.page, query.limit, query.filters);
    
    return new FindAllUsersResponse(
      users.map(user => ({
        id: user.id.get_value(),
        name: user.name,
        email: user.email.get_value(),
        role_id: user.role_id,
        is_active: user.is_active,
        created_at: user.created_at
      })),
      total,
      query.page,
      query.limit
    );
  }
}
