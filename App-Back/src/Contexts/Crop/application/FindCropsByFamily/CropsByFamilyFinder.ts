import { Crop } from '../../domain/Crop';
import { CropRepository } from '../../domain/CropRepository';

export class CropsByFamilyFinder {
  constructor(private repository: CropRepository) {}

  async run(family: string): Promise<Crop[]> {
    return this.repository.search_by_family(family);
  }
}
