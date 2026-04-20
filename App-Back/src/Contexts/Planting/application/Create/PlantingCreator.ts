import { Planting } from '../../domain/Planting';
import { PlantingId } from '../../domain/value-objects/PlantingId';
import { PlantingRepository } from '../../domain/PlantingRepository';
import { CropId } from '../../../Crop/domain/value-objects/CropId';
import { GardenId } from '../../../Garden/domain/value-objects/GardenId';
import { TaskRepository } from '../../../Task/domain/TaskRepository';
import { TaskGenerator } from '../../../Task/application/GenerateTasks/TaskGenerator';

export class PlantingCreator {
  constructor(
    private repository: PlantingRepository,
    private taskRepository: TaskRepository,
    private taskGenerator: TaskGenerator
  ) {}

  async run(
    id: string,
    crop_id: string,
    garden_id: string,
    plot_id: string,
    planted_at: Date,
    expected_harvest_at: Date,
    quantity: number,
    crop_name?: string,
    days_to_maturity?: number
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

    if (garden_id && plot_id && planted_at && crop_name && days_to_maturity) {
      const tasks = this.taskGenerator.generateFromPlanting(
        id,
        garden_id,
        plot_id,
        planted_at,
        days_to_maturity,
        crop_name
      );
      
      for (const task of tasks) {
        await this.taskRepository.save(task);
      }
    }

    return planting;
  }
}
