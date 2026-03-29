import { Planting } from '../../domain/Planting';
import { PlantingRepository } from '../../domain/PlantingRepository';
import { CropRepository } from '../../../Crop/domain/CropRepository';

export class ArchivedPlantingsFinder {
  constructor(
    private plantingRepository: PlantingRepository,
    private cropRepository: CropRepository
  ) {}

  async run(garden_id: string): Promise<{ plantings: Planting[]; cropRepository: CropRepository }> {
    const plantings = await this.plantingRepository.search_archived_by_garden(garden_id);
    return { plantings, cropRepository: this.cropRepository };
  }
}
