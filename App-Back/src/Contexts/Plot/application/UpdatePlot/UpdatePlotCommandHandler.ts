import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { UpdatePlotCommand } from './UpdatePlotCommand';
import { PlotRepository } from '../../domain/PlotRepository';

export class UpdatePlotCommandHandler implements CommandHandler<UpdatePlotCommand> {
  constructor(private repository: PlotRepository) {}

  subscribedTo(): Command {
    return UpdatePlotCommand;
  }

  async handle(command: UpdatePlotCommand): Promise<void> {
    const plot = await this.repository.search_by_id(command.id);
    
    if (!plot) {
      throw new Error('Plot not found');
    }

    await this.repository.save(plot);
  }
}
