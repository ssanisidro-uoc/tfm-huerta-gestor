import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { ManageCropCommand } from './ManageCropCommand';
import { CropManager } from './CropManager';

export class ManageCropCommandHandler implements CommandHandler<ManageCropCommand> {
  constructor(private cropManager: CropManager) {}

  subscribedTo(): Command {
    return ManageCropCommand;
  }

  async handle(command: ManageCropCommand): Promise<void> {
    await this.cropManager.run({
      id: command.id,
      name: command.name,
      scientific_name: command.scientific_name,
      family: command.family,
      days_to_maturity: command.days_to_maturity,
      min_temperature: command.min_temperature,
      max_temperature: command.max_temperature,
      created_by: command.created_by
    });
  }
}
