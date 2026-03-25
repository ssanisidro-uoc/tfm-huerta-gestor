import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { CompleteTaskCommand } from './CompleteTaskCommand';
import { TaskCompleter } from './TaskCompleter';

export class CompleteTaskCommandHandler implements CommandHandler<CompleteTaskCommand> {
  constructor(private completer: TaskCompleter) {}

  subscribedTo(): Command {
    return CompleteTaskCommand;
  }

  async handle(command: CompleteTaskCommand): Promise<void> {
    await this.completer.run(command.id, {
      completed_by: command.completed_by,
      completion_notes: command.completion_notes,
      actual_duration_minutes: command.actual_duration_minutes
    });
  }
}
