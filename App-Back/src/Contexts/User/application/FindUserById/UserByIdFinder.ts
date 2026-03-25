import { User } from '../../domain/User';
import { UserRepository } from '../../domain/UserRepository';

export class UserByIdFinder {
  constructor(private repository: UserRepository) {}

  async run(id: string): Promise<User | null> {
    return this.repository.search_by_id(id);
  }
}
