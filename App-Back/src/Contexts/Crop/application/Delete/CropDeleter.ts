import { CropRepository } from '../../domain/CropRepository';
import { logger } from '../../../Shared/infrastructure/Logger';

export class CropDeleter {
  constructor(private cropRepository: CropRepository) {}

  async run(data: { id: string; deleted_by: string }): Promise<void> {
    const crop = await this.cropRepository.search_by_id(data.id);

    if (!crop) {
      throw new Error('Crop not found');
    }

    await this.cropRepository.delete(data.id);

    logger.info(`Crop deleted: ${data.id} by ${data.deleted_by}`, 'CropDeleter');
  }
}
