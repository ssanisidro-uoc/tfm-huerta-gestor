import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetPlantingStatusQuery } from './GetPlantingStatusQuery';
import { GetPlantingStatusResponse } from './GetPlantingStatusResponse';
import { GetPlantingStatusFinder } from './GetPlantingStatusFinder';

export class GetPlantingStatusQueryHandler implements QueryHandler<GetPlantingStatusQuery, GetPlantingStatusResponse> {
  constructor(private finder: GetPlantingStatusFinder) {}

  subscribedTo(): Query {
    return GetPlantingStatusQuery;
  }

  async handle(query: GetPlantingStatusQuery): Promise<GetPlantingStatusResponse> {
    return this.finder.run(query.planting_id, query.user_id);
  }
}
