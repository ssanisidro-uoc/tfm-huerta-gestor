import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { DeleteManualTaskCommand } from './DeleteManualTaskCommand';
import { TaskRepository } from '../../domain/TaskRepository';
import { AppError } from '../../../Shared/domain/AppError';

export class DeleteManualTaskCommandHandler implements CommandHandler<DeleteManualTaskCommand> {
  constructor(private taskRepository: TaskRepository) {}

  subscribedTo(): Command {
    return DeleteManualTaskCommand;
  }

  async handle(command: DeleteManualTaskCommand): Promise<void> {
    const task = await this.taskRepository.search_by_id(command.task_id);
    if (!task) {
      throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found');
    }

    if (task.is_recurring) {
      throw new AppError(400, 'CANNOT_DELETE_RECURRING_TASK', 'Cannot delete recurring tasks manually');
    }

    await this.taskRepository.delete(command.task_id);
  }
}
