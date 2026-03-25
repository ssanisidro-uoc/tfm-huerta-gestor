import { Query } from '../../../Shared/domain/Query';

export class FindUserGardensQuery implements Query {
  constructor(readonly user_id: string) {}
}
