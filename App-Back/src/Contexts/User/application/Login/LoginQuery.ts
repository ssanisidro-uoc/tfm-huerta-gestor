import { Query } from '../../../Shared/domain/Query';

export class LoginQuery extends Query {
  constructor(
    readonly email: string,
    readonly password: string
  ) {
    super();
  }
}
