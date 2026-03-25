import { User } from '../../domain/User';
import { UserEmail } from '../../domain/UserEmail';
import { UserId } from '../../domain/UserId';
import { UserRepository } from '../../domain/UserRepository';

export class UserCreator {
  constructor(private repository: UserRepository) {}

  async run(
    id: string,
    name: string,
    email: string,
    password_hash: string,
    role_id: string
  ): Promise<void> {
    const user_id: UserId = new UserId(id);
    const user_email: UserEmail = new UserEmail(email);

    const user: User = User.create(user_id, name, user_email, password_hash, role_id);

    await this.repository.save(user);
  }
}
