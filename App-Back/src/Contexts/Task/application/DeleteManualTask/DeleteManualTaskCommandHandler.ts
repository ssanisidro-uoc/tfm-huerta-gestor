import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { DeleteManualTaskCommand } from './DeleteManualTaskCommand';
import { TaskDeleter } from './TaskDeleter';

export class DeleteManualTaskCommandHandler implements CommandHandler<DeleteManualTaskCommand> {
  constructor(private deleter: TaskDeleter) {}

  subscribedTo(): Command {
    return DeleteManualTaskCommand;
  }

  async handle(command: DeleteManualTaskCommand): Promise<void> {
    await this.deleter.run(command.task_id);
  }
}