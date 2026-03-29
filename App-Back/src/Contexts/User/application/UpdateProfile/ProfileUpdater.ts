import { User } from '../../domain/User';
import { UserRepository } from '../../domain/UserRepository';
import { PasswordHasher } from '../../../Shared/infrastructure/auth/PasswordHasher';
import { UserId } from '../../domain/UserId';
import { UserEmail } from '../../domain/UserEmail';
import { AppError } from '../../../Shared/domain/AppError';

export class ProfileUpdater {
  constructor(
    private repository: UserRepository,
    private passwordHasher: PasswordHasher
  ) {}

  async run(
    userId: string,
    data: {
      name?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    }
  ): Promise<void> {
    const user = await this.repository.search_by_id(userId);

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', `User with id ${userId} not found`);
    }

    if (data.email && data.email !== user.email.get_value()) {
      const existingUser = await this.repository.find_by_email(data.email);
      if (existingUser && existingUser.id.get_value() !== userId) {
        throw new AppError(400, 'USER_EMAIL_EXISTS', 'Email already in use');
      }
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new AppError(400, 'AUTH_CURRENT_PASSWORD_REQUIRED', 'Current password is required to change password');
      }

      const isPasswordValid = await this.passwordHasher.compare_password(
        data.currentPassword,
        user.password_hash
      );

      if (!isPasswordValid) {
        throw new AppError(401, 'AUTH_INVALID_CURRENT_PASSWORD', 'Current password is incorrect');
      }
    }

    let newPasswordHash = user.password_hash;
    if (data.newPassword) {
      newPasswordHash = await this.passwordHasher.hash_password(data.newPassword);
    }

    const updatedUser = new User(
      new UserId(userId),
      data.name ?? user.name,
      data.email ? new UserEmail(data.email) : user.email,
      data.newPassword ?? user.password,
      newPasswordHash,
      user.role_id,
      user.is_active,
      user.created_at,
      new Date()
    );

    await this.repository.update(updatedUser);
  }
}
