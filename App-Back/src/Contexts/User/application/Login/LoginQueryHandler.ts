import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { LoginQuery } from './LoginQuery';
import { UserRepository } from '../../domain/UserRepository';
import { PasswordHasher } from '../../../Shared/infrastructure/auth/PasswordHasher';
import { JwtHandler } from '../../../Shared/infrastructure/auth/JwtHandler';
import { AppError } from '../../../Shared/domain/AppError';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role_id: string;
  };
}

export class LoginQueryHandler implements QueryHandler<LoginQuery, LoginResponse> {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher,
    private jwtHandler: JwtHandler
  ) {}

  subscribedTo(): Query {
    return LoginQuery;
  }

  async handle(query: LoginQuery): Promise<LoginResponse> {
    const user = await this.userRepository.find_by_email(query.email);

    if (!user) {
      throw new AppError(401, 'AUTH_INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isPasswordValid = await this.passwordHasher.compare_password(
      query.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      throw new AppError(401, 'AUTH_INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const token = this.jwtHandler.generate_token({
      userId: user.id.get_value(),
      email: user.email.get_value(),
      role: user.role_id
    });

    return {
      token,
      user: {
        id: user.id.get_value(),
        email: user.email.get_value(),
        name: user.name,
        role_id: user.role_id
      }
    };
  }
}
