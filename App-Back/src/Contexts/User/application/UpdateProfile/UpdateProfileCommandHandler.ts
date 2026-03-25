import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { UpdateProfileCommand } from './UpdateProfileCommand';
import { UserRepository } from '../../domain/UserRepository';
import { PasswordHasher } from '../../../Shared/infrastructure/auth/PasswordHasher';
import { User } from '../../domain/User';
import { UserId } from '../../domain/UserId';
import { UserEmail } from '../../domain/UserEmail';
import { AppError } from '../../../Shared/domain/AppError';

export class UpdateProfileCommandHandler implements CommandHandler<UpdateProfileCommand> {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher
  ) {}

  subscribedTo(): Command {
    return UpdateProfileCommand;
  }

  async handle(command: UpdateProfileCommand): Promise<void> {
    const user = await this.userRepository.search_by_id(command.user_id);

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', `User with id ${command.user_id} not found`);
    }

    if (command.email && command.email !== user.email.get_value()) {
      const existingUser = await this.userRepository.find_by_email(command.email);
      if (existingUser && existingUser.id.get_value() !== command.user_id) {
        throw new AppError(400, 'USER_EMAIL_EXISTS', 'Email already in use');
      }
    }

    if (command.newPassword) {
      if (!command.currentPassword) {
        throw new AppError(400, 'AUTH_CURRENT_PASSWORD_REQUIRED', 'Current password is required to change password');
      }

      const isPasswordValid = await this.passwordHasher.compare_password(
        command.currentPassword,
        user.password_hash
      );

      if (!isPasswordValid) {
        throw new AppError(401, 'AUTH_INVALID_CURRENT_PASSWORD', 'Current password is incorrect');
      }
    }

    let newPasswordHash = user.password_hash;
    if (command.newPassword) {
      newPasswordHash = await this.passwordHasher.hash_password(command.newPassword);
    }

    const updatedUser = new User(
      new UserId(command.user_id),
      command.name ?? user.name,
      command.email ? new UserEmail(command.email) : user.email,
      command.newPassword ?? user.password,
      newPasswordHash,
      user.role_id,
      user.is_active,
      user.created_at,
      new Date()
    );

    await this.userRepository.update(updatedUser);
  }
}
