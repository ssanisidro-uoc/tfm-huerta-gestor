import { Planting } from '../../domain/Planting';
import { PlantingId } from '../../domain/value-objects/PlantingId';
import { PlantingRepository } from '../../domain/PlantingRepository';
import { CropId } from '../../../Crop/domain/value-objects/CropId';
import { GardenId } from '../../../Garden/domain/value-objects/GardenId';

export class PlantingCreator {
  constructor(private repository: PlantingRepository) {}

  async run(
    id: string,
    crop_id: string,
    garden_id: string,
    plot_id: string,
    planted_at: Date,
    expected_harvest_at: Date,
    quantity: number
  ): Promise<Planting> {
    const planting = Planting.create(
      new PlantingId(id),
      new CropId(crop_id),
      new GardenId(garden_id),
      plot_id,
      planted_at,
      expected_harvest_at,
      quantity
    );

    await this.repository.save(planting);
    return planting;
  }
}
