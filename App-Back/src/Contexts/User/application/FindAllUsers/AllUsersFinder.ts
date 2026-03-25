import { User } from '../../domain/User';
import { UserRepository } from '../../domain/UserRepository';

export class AllUsersFinder {
  constructor(private repository: UserRepository) {}

  async run(
    page: number = 1,
    limit: number = 20,
    filters?: { is_active?: boolean; role_id?: string }
  ): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;
    const users = await this.repository.search_all({ page, limit, offset, filters });
    const total = await this.repository.count(filters);
    return { users, total };
  }
}
