import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { DeletePlotCommand } from './DeletePlotCommand';
import { PlotDeleter } from './PlotDeleter';

export class DeletePlotCommandHandler implements CommandHandler<DeletePlotCommand> {
  constructor(private deleter: PlotDeleter) {}

  subscribedTo(): Command {
    return DeletePlotCommand;
  }

  async handle(command: DeletePlotCommand): Promise<void> {
    await this.deleter.run(command.id);
  }
}