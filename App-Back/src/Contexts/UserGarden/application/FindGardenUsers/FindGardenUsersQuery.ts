import { Query } from '../../../Shared/domain/Query';

export class FindGardenUsersQuery implements Query {
  constructor(readonly garden_id: string) {}
}
