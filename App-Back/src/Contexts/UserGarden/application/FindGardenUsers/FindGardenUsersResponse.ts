import { Response } from '../../../Shared/domain/Response';

export class FindGardenUsersResponse implements Response {
  constructor(
    readonly users: Array<{
      id: string;
      user_id: string;
      garden_role: string;
      created_at: Date;
    }>
  ) {}
}
