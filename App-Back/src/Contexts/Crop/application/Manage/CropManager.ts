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
    days_to_harvest_min: number;
    days_to_harvest_max: number;
    category: string;
    lifecycle?: string;
    sun_requirement?: string;
    water_requirement?: string;
    min_temperature_c?: number;
    max_temperature_c?: number;
    created_by: string;
  }): Promise<Crop> {
    const now = new Date();
    const cropId = data.id ? new CropId(data.id) : new CropId(crypto.randomUUID());

    const crop = new Crop(
      cropId,
      new CropName(data.name),
      data.scientific_name,
      data.family,
      data.category,
      data.lifecycle || 'annual',
      'herbaceous',
      data.days_to_harvest_min,
      data.days_to_harvest_max,
      data.days_to_harvest_max,
      7,
      data.min_temperature_c || 10,
      data.max_temperature_c || 35,
      15,
      30,
      false,
      false,
      data.sun_requirement || 'full_sun',
      6,
      'low',
      [],
      6.0,
      7.5,
      'medium',
      'medium',
      data.water_requirement || 'moderate',
      false,
      false,
      30,
      60,
      1,
      3,
      10,
      5,
      11,
      [],
      [],
      'default',
      3,
      [],
      [],
      'medium',
      false,
      false,
      false,
      2.5,
      'single',
      '',
      '',
      '',
      '',
      '',
      null,
      data.id ? now : now,
      now
    );

    await this.cropRepository.save(crop);

    logger.info(`Crop ${data.id ? 'updated' : 'created'}: ${data.name} by ${data.created_by}`, 'CropManager');

    return crop;
  }
}
