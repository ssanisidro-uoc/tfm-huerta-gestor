import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { ManageCropCommand } from './ManageCropCommand';
import { CropManager } from './CropManager';

export class ManageCropCommandHandler implements CommandHandler<ManageCropCommand> {
  constructor(private cropManager: CropManager) {}

  subscribedTo(): Command {
    return ManageCropCommand;
  }

  async handle(command: ManageCropCommand): Promise<void> {
    await this.cropManager.run({
      id: command.id,
      name: command.name,
      scientific_name: command.scientific_name,
      family: command.family,
      days_to_harvest_min: command.days_to_harvest_min,
      days_to_harvest_max: command.days_to_harvest_max,
      category: command.category,
      min_temperature_c: command.min_temperature_c,
      max_temperature_c: command.max_temperature_c,
      sun_requirement: command.sun_requirement,
      water_requirement: command.water_requirement,
      created_by: command.created_by
    });
  }
}
