import { Garden } from '../../domain/Garden';
import { GardenRepository } from '../../domain/GardenRepository';

export class AllGardensFinder {
  constructor(private repository: GardenRepository) {}

  async run(
    owner_id: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ gardens: Garden[]; total: number }> {
    const offset = (page - 1) * limit;
    const gardens = await this.repository.find_by_owner(owner_id, { page, limit, offset });
    const total = await this.repository.count_by_owner(owner_id);
    return { gardens, total };
  }
}
