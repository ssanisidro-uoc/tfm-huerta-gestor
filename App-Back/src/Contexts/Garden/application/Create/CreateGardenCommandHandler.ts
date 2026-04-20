import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { CreateGardenCommand } from './CreateGardenCommand';
import { GardenCreator } from './GardenCreator';

export class CreateGardenCommandHandler implements CommandHandler<CreateGardenCommand> {
  constructor(private creator: GardenCreator) {}

  subscribedTo(): Command {
    return CreateGardenCommand;
  }

  async handle(command: CreateGardenCommand): Promise<void> {
    await this.creator.run({
      id: command.id,
      owner_id: command.owner_id,
      name: command.name,
      description: command.description,
      surface_m2: command.surface_m2,
      climate_zone: command.climate_zone,
      hardiness_zone: command.hardiness_zone,
      location: command.location
    });
  }
}
