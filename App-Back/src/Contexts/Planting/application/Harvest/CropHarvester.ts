import { PlantingRepository } from '../../domain/PlantingRepository';
import { Planting, PlantingStatus } from '../../domain/Planting';
import { logger } from '../../../Shared/infrastructure/Logger';

export class CropHarvester {
  constructor(private plantingRepository: PlantingRepository) {}

  async run(data: {
    id: string;
    harvested_by: string;
    harvest_date: Date;
    total_harvest_kg?: number;
    harvest_quality?: string;
    harvest_notes?: string;
  }): Promise<Planting> {
    const planting = await this.plantingRepository.search_by_id(data.id);

    if (!planting) {
      throw new Error('Planting not found');
    }

    if (!planting.is_active) {
      throw new Error('Planting is not active');
    }

    if (planting.status === 'completed' || planting.status === 'archived') {
      throw new Error('Planting is already completed or archived');
    }

    const now = new Date();
    const archivedPlanting = new Planting(
      planting.id,
      planting.crop_id,
      planting.garden_id,
      planting.plot_id,
      planting.created_by,
      planting.variety,
      planting.custom_name,
      planting.planted_at,
      planting.expected_harvest_at,
      data.harvest_date,
      'harvested' as PlantingStatus,
      planting.health_status,
      planting.quantity,
      false,
      data.total_harvest_kg ?? null,
      data.harvest_quality ?? null,
      data.harvest_notes ?? null,
      now,
      now
    );

    await this.plantingRepository.save(archivedPlanting);

    logger.info(
      `Crop harvested: planting ${data.id}, date ${data.harvest_date}, by ${data.harvested_by}`,
      'CropHarvester'
    );

    return archivedPlanting;
  }
}
