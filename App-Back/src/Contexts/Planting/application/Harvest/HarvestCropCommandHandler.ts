import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { HarvestCropCommand } from './HarvestCropCommand';
import { CropHarvester } from './CropHarvester';

export class HarvestCropCommandHandler implements CommandHandler<HarvestCropCommand> {
  constructor(private harvester: CropHarvester) {}

  subscribedTo(): Command {
    return HarvestCropCommand;
  }

  async handle(command: HarvestCropCommand): Promise<void> {
    await this.harvester.run({
      id: command.id,
      harvested_by: command.harvested_by,
      harvest_date: command.harvest_date,
      total_harvest_kg: command.total_harvest_kg,
      harvest_quality: command.harvest_quality,
      harvest_notes: command.harvest_notes
    });
  }
}
