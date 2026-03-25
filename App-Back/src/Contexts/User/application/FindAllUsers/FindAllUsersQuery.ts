import { Query } from '../../../Shared/domain/Query';

export class FindAllUsersQuery implements Query {
  constructor(
    readonly page: number = 1,
    readonly limit: number = 20,
    readonly filters?: {
      is_active?: boolean;
      role_id?: string;
    }
  ) {}
}
