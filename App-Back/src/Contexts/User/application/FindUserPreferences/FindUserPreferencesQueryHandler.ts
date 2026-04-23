import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindUserPreferencesQuery } from './FindUserPreferencesQuery';
import { UserPreferencesFinder } from './UserPreferencesFinder';

export class FindUserPreferencesQueryHandler implements QueryHandler<FindUserPreferencesQuery, any> {
  constructor(private finder: UserPreferencesFinder) {}

  subscribedTo(): Query {
    return FindUserPreferencesQuery;
  }

  async handle(query: FindUserPreferencesQuery): Promise<any> {
    const preferences = await this.finder.run(query.user_id);

    if (!preferences) {
      return null;
    }

    return preferences.to_response();
  }
}