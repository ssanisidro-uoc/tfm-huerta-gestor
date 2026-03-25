import { Response } from '../../../Shared/domain/Response';

export class FindAllUsersResponse implements Response {
  constructor(
    readonly users: Array<{
      id: string;
      name: string;
      email: string;
      role_id: string;
      is_active: boolean;
      created_at: Date;
    }>,
    readonly total: number,
    readonly page: number,
    readonly limit: number
  ) {}
}
