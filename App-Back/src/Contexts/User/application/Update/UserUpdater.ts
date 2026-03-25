import { User } from '../../domain/User';
import { UserRepository } from '../../domain/UserRepository';
import { UserNotFoundError } from '../../domain/errors/UserErrors';
import { PasswordHasher } from '../../../Shared/infrastructure/auth/PasswordHasher';

export class UserUpdater {
  constructor(
    private repository: UserRepository,
    private passwordHasher: PasswordHasher
  ) {}

  async run(
    id: string,
    data: { name?: string; email?: string; password?: string; role_id?: string; is_active?: boolean }
  ): Promise<User> {
    const user = await this.repository.search_by_id(id);
    
    if (!user) {
      throw new UserNotFoundError(id);
    }

    let newPasswordHash = user.password_hash;
    if (data.password) {
      newPasswordHash = await this.passwordHasher.hash_password(data.password);
    }

    const updatedUser = new User(
      user.id,
      data.name ?? user.name,
      user.email,
      data.password ?? user.password,
      newPasswordHash,
      data.role_id ?? user.role_id,
      data.is_active ?? user.is_active,
      user.created_at,
      new Date()
    );

    await this.repository.update(updatedUser);
    return updatedUser;
  }
}
