import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetTaskIntelligenceQuery } from './GetTaskIntelligenceQuery';
import { GetTaskIntelligenceResponse } from './GetTaskIntelligenceResponse';
import { UnifiedIntelligenceService } from '../UnifiedIntelligence/UnifiedIntelligenceService';

export class GetTaskIntelligenceQueryHandler implements QueryHandler<GetTaskIntelligenceQuery, GetTaskIntelligenceResponse> {
  constructor(private service: UnifiedIntelligenceService) {}

  subscribedTo(): Query {
    return GetTaskIntelligenceQuery;
  }

  async handle(query: GetTaskIntelligenceQuery): Promise<GetTaskIntelligenceResponse> {
    const intelligence = await this.service.getIntelligenceForTask(query.taskId);
    return new GetTaskIntelligenceResponse(intelligence!);
  }
}
