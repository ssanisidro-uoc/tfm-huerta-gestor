import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { UpdatePlotCommand } from './UpdatePlotCommand';
import { PlotUpdater } from './PlotUpdater';

export class UpdatePlotCommandHandler implements CommandHandler<UpdatePlotCommand> {
  constructor(private updater: PlotUpdater) {}

  subscribedTo(): Command {
    return UpdatePlotCommand;
  }

  async handle(command: UpdatePlotCommand): Promise<void> {
    await this.updater.run(command.id, command.data);
  }
}
