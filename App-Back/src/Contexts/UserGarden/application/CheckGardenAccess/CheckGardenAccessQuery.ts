import { Query } from '../../../Shared/domain/Query';

export class CheckGardenAccessQuery extends Query {
  constructor(
    readonly userId: string,
    readonly gardenId: string,
    readonly requiredRole: string = 'viewer'
  ) {
    super();
  }
}
