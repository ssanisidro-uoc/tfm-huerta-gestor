import { Query } from '../../../Shared/domain/Query';

export class GetMyGardensQuery extends Query {
  constructor(readonly user_id: string) {
    super();
  }
}