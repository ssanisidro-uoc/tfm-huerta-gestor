import { Response } from '../../../Shared/domain/Response';

export class FindUserGardensResponse implements Response {
  constructor(
    readonly gardens: Array<{
      id: string;
      garden_id: string;
      garden_role: string;
      created_at: Date;
    }>
  ) {}
}
