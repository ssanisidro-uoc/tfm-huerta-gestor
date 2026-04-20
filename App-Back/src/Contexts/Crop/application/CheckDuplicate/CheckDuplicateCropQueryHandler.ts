import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { CheckDuplicateCropQuery } from './CheckDuplicateCropQuery';
import { CheckDuplicateCropResponse } from './CheckDuplicateCropResponse';
import { CropDuplicateChecker } from './CropDuplicateChecker';

export class CheckDuplicateCropQueryHandler implements QueryHandler<CheckDuplicateCropQuery, CheckDuplicateCropResponse> {
  constructor(private checker: CropDuplicateChecker) {}

  subscribedTo(): Query {
    return CheckDuplicateCropQuery;
  }

  async handle(query: CheckDuplicateCropQuery): Promise<CheckDuplicateCropResponse> {
    return this.checker.check(query.name, query.scientificName, query.excludeId);
  }
}
