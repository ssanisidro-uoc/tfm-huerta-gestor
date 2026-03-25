import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { CreateTaskCommand } from './CreateTaskCommand';
import { TaskCreator } from './TaskCreator';

export class CreateTaskCommandHandler implements CommandHandler<CreateTaskCommand> {
  constructor(private creator: TaskCreator) {}

  subscribedTo(): Command {
    return CreateTaskCommand;
  }

  async handle(command: CreateTaskCommand): Promise<void> {
    await this.creator.run(
      command.id,
      command.title,
      command.description,
      command.garden_id,
      command.task_type,
      command.scheduled_date,
      command.assigned_to,
      command.due_date,
      command.is_recurring,
      command.recurrence_pattern
    );
  }
}
