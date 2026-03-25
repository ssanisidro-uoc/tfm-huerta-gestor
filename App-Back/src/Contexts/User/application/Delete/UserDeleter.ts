import { UserRepository } from '../../domain/UserRepository';
import { UserNotFoundError } from '../../domain/errors/UserErrors';

export class UserDeleter {
  constructor(private repository: UserRepository) {}

  async run(id: string): Promise<void> {
    const user = await this.repository.search_by_id(id);
    
    if (!user) {
      throw new UserNotFoundError(id);
    }

    await this.repository.delete(id);
  }
}
