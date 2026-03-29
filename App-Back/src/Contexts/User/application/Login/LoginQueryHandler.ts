import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { LoginQuery } from './LoginQuery';
import { Authenticator, AuthResult } from './Authenticator';

export class LoginQueryHandler implements QueryHandler<LoginQuery, AuthResult> {
  constructor(private authenticator: Authenticator) {}

  subscribedTo(): Query {
    return LoginQuery;
  }

  async handle(query: LoginQuery): Promise<AuthResult> {
    return this.authenticator.run(query.email, query.password);
  }
}
