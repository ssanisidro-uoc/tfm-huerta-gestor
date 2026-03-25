import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { UpdateGardenCommand } from './UpdateGardenCommand';
import { GardenUpdater } from './GardenUpdater';

export class UpdateGardenCommandHandler implements CommandHandler<UpdateGardenCommand> {
  constructor(private updater: GardenUpdater) {}

  subscribedTo(): Command {
    return UpdateGardenCommand;
  }

  async handle(command: UpdateGardenCommand): Promise<void> {
    await this.updater.run(command.id, command.data);
  }
}
