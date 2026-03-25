import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { CreatePlantingCommand } from './CreatePlantingCommand';
import { PlantingCreator } from './PlantingCreator';

export class CreatePlantingCommandHandler implements CommandHandler<CreatePlantingCommand> {
  constructor(private creator: PlantingCreator) {}

  subscribedTo(): Command {
    return CreatePlantingCommand;
  }

  async handle(command: CreatePlantingCommand): Promise<void> {
    await this.creator.run(
      command.id,
      command.crop_id,
      command.garden_id,
      command.plot_id,
      command.planted_at,
      command.expected_harvest_at,
      command.quantity,
      command.unit
    );
  }
}
