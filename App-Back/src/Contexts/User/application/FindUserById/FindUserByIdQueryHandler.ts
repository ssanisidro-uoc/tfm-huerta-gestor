import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindUserByIdQuery } from './FindUserByIdQuery';
import { FindUserByIdResponse } from './FindUserByIdResponse';
import { UserByIdFinder } from './UserByIdFinder';

export class FindUserByIdQueryHandler implements QueryHandler<FindUserByIdQuery, FindUserByIdResponse> {
  constructor(private finder: UserByIdFinder) {}

  subscribedTo(): Query {
    return FindUserByIdQuery;
  }

  async handle(query: FindUserByIdQuery): Promise<FindUserByIdResponse> {
    const user = await this.finder.run(query.id);
    if (!user) {
      throw new Error(`User with id ${query.id} not found`);
    }
    return new FindUserByIdResponse(
      user.id.get_value(),
      user.email.get_value(),
      user.role_id,
      user.is_active,
      user.created_at
    );
  }
}
