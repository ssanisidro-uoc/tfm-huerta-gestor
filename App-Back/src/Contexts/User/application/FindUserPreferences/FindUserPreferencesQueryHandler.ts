import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindUserPreferencesQuery } from './FindUserPreferencesQuery';
import { UserPreferencesRepository } from '../../domain/UserPreferencesRepository';

export class FindUserPreferencesQueryHandler implements QueryHandler<FindUserPreferencesQuery, any> {
  constructor(private userPreferencesRepository: UserPreferencesRepository) {}

  subscribedTo(): Query {
    return FindUserPreferencesQuery;
  }

  async handle(query: FindUserPreferencesQuery): Promise<any> {
    const preferences = await this.userPreferencesRepository.search_by_user_id(query.user_id);

    if (!preferences) {
      return null;
    }

    return preferences.to_response();
  }
}