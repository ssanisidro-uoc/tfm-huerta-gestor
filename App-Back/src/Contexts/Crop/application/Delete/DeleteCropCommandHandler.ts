import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { DeleteCropCommand } from './DeleteCropCommand';
import { CropDeleter } from './CropDeleter';

export class DeleteCropCommandHandler implements CommandHandler<DeleteCropCommand> {
  constructor(private cropDeleter: CropDeleter) {}

  subscribedTo(): Command {
    return DeleteCropCommand;
  }

  async handle(command: DeleteCropCommand): Promise<void> {
    await this.cropDeleter.run({
      id: command.id,
      deleted_by: command.deleted_by
    });
  }
}
