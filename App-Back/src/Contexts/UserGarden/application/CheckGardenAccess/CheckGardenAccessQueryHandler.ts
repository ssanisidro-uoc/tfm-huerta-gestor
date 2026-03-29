import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { CheckGardenAccessQuery } from './CheckGardenAccessQuery';
import { CheckGardenAccessResponse } from './CheckGardenAccessResponse';
import { CheckGardenAccessFinder } from './CheckGardenAccessFinder';

export class CheckGardenAccessQueryHandler implements QueryHandler<CheckGardenAccessQuery, CheckGardenAccessResponse> {
  constructor(private finder: CheckGardenAccessFinder) {}

  subscribedTo(): Query {
    return CheckGardenAccessQuery;
  }

  async handle(query: CheckGardenAccessQuery): Promise<CheckGardenAccessResponse> {
    return this.finder.run(query.userId, query.gardenId, query.requiredRole);
  }
}
