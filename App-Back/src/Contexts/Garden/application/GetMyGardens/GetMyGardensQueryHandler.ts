import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetMyGardensQuery } from './GetMyGardensQuery';
import { MyGardensFinder, MyGardensResponse } from './MyGardensFinder';

export class GetMyGardensQueryHandler implements QueryHandler<GetMyGardensQuery, MyGardensResponse> {
  constructor(private finder: MyGardensFinder) {}

  subscribedTo(): Query {
    return GetMyGardensQuery;
  }

  async handle(query: GetMyGardensQuery): Promise<MyGardensResponse> {
    return await this.finder.run(query.user_id);
  }
}