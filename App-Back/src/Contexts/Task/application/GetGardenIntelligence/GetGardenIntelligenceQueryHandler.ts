import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetGardenIntelligenceQuery } from './GetGardenIntelligenceQuery';
import { GetGardenIntelligenceResponse } from './GetGardenIntelligenceResponse';
import { UnifiedIntelligenceService } from '../UnifiedIntelligence/UnifiedIntelligenceService';

export class GetGardenIntelligenceQueryHandler implements QueryHandler<GetGardenIntelligenceQuery, GetGardenIntelligenceResponse> {
  constructor(private service: UnifiedIntelligenceService) {}

  subscribedTo(): Query {
    return GetGardenIntelligenceQuery;
  }

  async handle(query: GetGardenIntelligenceQuery): Promise<GetGardenIntelligenceResponse> {
    const intelligences = await this.service.getIntelligenceForGarden(query.gardenId, query.daysAhead);
    return new GetGardenIntelligenceResponse(intelligences);
  }
}
