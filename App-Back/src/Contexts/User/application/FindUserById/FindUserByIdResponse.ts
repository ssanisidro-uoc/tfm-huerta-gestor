import { Response } from '../../../Shared/domain/Response';

export class FindUserByIdResponse implements Response {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly role_id: string,
    readonly is_active: boolean,
    readonly created_at: Date
  ) {}
}
