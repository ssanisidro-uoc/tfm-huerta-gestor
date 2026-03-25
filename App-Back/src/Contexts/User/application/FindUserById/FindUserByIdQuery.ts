import { Query } from '../../../Shared/domain/Query';

export class FindUserByIdQuery extends Query {
  constructor(readonly id: string) {
    super();
  }
}
