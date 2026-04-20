import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetRotationRulesQuery } from './GetRotationRulesQuery';
import { GetRotationRulesResponse } from './GetRotationRulesResponse';
import { RotationRulesFinder } from './RotationRulesFinder';

export class GetRotationRulesQueryHandler implements QueryHandler<GetRotationRulesQuery, GetRotationRulesResponse> {
  constructor(private finder: RotationRulesFinder) {}

  subscribedTo(): Query {
    return GetRotationRulesQuery;
  }

  async handle(query: GetRotationRulesQuery): Promise<GetRotationRulesResponse> {
    if (query.nextCropId) {
      return {
        rules: [],
        total: 0,
        page: 1,
        limit: 1
      };
    }
    return this.finder.findRulesForCrop(query.previousCropId, query.page, query.limit);
  }
}
