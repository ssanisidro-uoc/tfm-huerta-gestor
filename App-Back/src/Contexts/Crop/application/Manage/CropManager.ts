import { CropRepository } from '../../domain/CropRepository';
import { Crop } from '../../domain/Crop';
import { CropId } from '../../domain/value-objects/CropId';
import { CropName } from '../../domain/value-objects/CropName';
import { logger } from '../../../Shared/infrastructure/Logger';

export class CropManager {
  constructor(private cropRepository: CropRepository) {}

  async run(data: {
    id?: string;
    name: string;
    scientific_name: string;
    family: string;
    days_to_maturity: number;
    min_temperature: number;
    max_temperature: number;
    created_by: string;
  }): Promise<Crop> {
    const now = new Date();
    const cropId = data.id ? new CropId(data.id) : new CropId(crypto.randomUUID());

    const crop = new Crop(
      cropId,
      new CropName(data.name),
      data.scientific_name,
      data.family,
      data.days_to_maturity,
      data.min_temperature,
      data.max_temperature,
      data.id ? now : now,
      now
    );

    await this.cropRepository.save(crop);

    logger.info(`Crop ${data.id ? 'updated' : 'created'}: ${data.name} by ${data.created_by}`, 'CropManager');

    return crop;
  }
}
