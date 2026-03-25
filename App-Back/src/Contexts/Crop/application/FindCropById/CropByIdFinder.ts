import { Crop } from '../../domain/Crop';
import { CropRepository } from '../../domain/CropRepository';

export class CropByIdFinder {
  constructor(private repository: CropRepository) {}

  async run(id: string): Promise<Crop | null> {
    return this.repository.search_by_id(id);
  }
}
