import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { CreateManualTaskCommand } from './CreateManualTaskCommand';
import { ManualTaskCreator } from './ManualTaskCreator';

export class CreateManualTaskCommandHandler implements CommandHandler<CreateManualTaskCommand> {
  constructor(private creator: ManualTaskCreator) {}

  subscribedTo(): Command {
    return CreateManualTaskCommand;
  }

  async handle(command: CreateManualTaskCommand): Promise<void> {
    await this.creator.run({
      id: command.id,
      garden_id: command.garden_id,
      plot_id: command.plot_id,
      planting_id: command.planting_id,
      task_type: command.task_type,
      task_category: command.task_category,
      title: command.title,
      description: command.description,
      scheduled_date: command.scheduled_date,
      due_date: command.due_date,
      estimated_duration_minutes: command.estimated_duration_minutes,
      priority: command.priority,
      created_by: command.created_by
    });
  }
}
