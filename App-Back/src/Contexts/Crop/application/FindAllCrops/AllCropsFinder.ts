import { Crop } from '../../domain/Crop';
import { CropRepository } from '../../domain/CropRepository';

export class AllCropsFinder {
  constructor(private repository: CropRepository) {}

  async run(
    page: number = 1,
    limit: number = 20,
    filters?: { category?: string; family?: string; search?: string }
  ): Promise<{ crops: Crop[]; total: number }> {
    const offset = (page - 1) * limit;
    const crops = await this.repository.search_all({ page, limit, offset, filters });
    const total = await this.repository.count(filters);
    return { crops, total };
  }
}
