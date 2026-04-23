import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { ListSharedGardensQuery } from './ListSharedGardensQuery';
import { SharedGardensFinder, SharedGardenResponse } from './SharedGardensFinder';

export class ListSharedGardensQueryHandler implements QueryHandler<ListSharedGardensQuery, SharedGardenResponse[]> {
  constructor(private finder: SharedGardensFinder) {}

  subscribedTo(): Query {
    return ListSharedGardensQuery;
  }

  async handle(query: ListSharedGardensQuery): Promise<SharedGardenResponse[]> {
    return await this.finder.run(query.user_id);
  }
}