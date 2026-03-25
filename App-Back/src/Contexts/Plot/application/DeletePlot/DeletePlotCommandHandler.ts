import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { DeletePlotCommand } from './DeletePlotCommand';
import { PlotRepository } from '../../domain/PlotRepository';

export class DeletePlotCommandHandler implements CommandHandler<DeletePlotCommand> {
  constructor(private repository: PlotRepository) {}

  subscribedTo(): Command {
    return DeletePlotCommand;
  }

  async handle(command: DeletePlotCommand): Promise<void> {
    const plot = await this.repository.search_by_id(command.id);
    
    if (!plot) {
      throw new Error('Plot not found');
    }

    await this.repository.delete(command.id);
  }
}
