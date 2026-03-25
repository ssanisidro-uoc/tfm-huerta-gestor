import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { DeleteGardenCommand } from './DeleteGardenCommand';
import { GardenDeleter } from './GardenDeleter';

export class DeleteGardenCommandHandler implements CommandHandler<DeleteGardenCommand> {
  constructor(private deleter: GardenDeleter) {}

  subscribedTo(): Command {
    return DeleteGardenCommand;
  }

  async handle(command: DeleteGardenCommand): Promise<void> {
    await this.deleter.run(command.id);
  }
}
