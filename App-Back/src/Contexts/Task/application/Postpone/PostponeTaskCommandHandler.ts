import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { PostponeTaskCommand } from './PostponeTaskCommand';
import { TaskRepository } from '../../domain/TaskRepository';
import { AppError } from '../../../Shared/domain/AppError';

export class PostponeTaskCommandHandler implements CommandHandler<PostponeTaskCommand> {
  constructor(private taskRepository: TaskRepository) {}

  subscribedTo(): Command {
    return PostponeTaskCommand;
  }

  async handle(command: PostponeTaskCommand): Promise<void> {
    const task = await this.taskRepository.search_by_id(command.task_id);
    if (!task) {
      throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found');
    }

    if (task.status === 'completed') {
      throw new AppError(400, 'TASK_ALREADY_COMPLETED', 'Cannot postpone a completed task');
    }

    if (task.status === 'cancelled') {
      throw new AppError(400, 'TASK_CANCELLED', 'Cannot postpone a cancelled task');
    }

    const postponedTask = task.postpone(command.postponed_by, command.reason || '', command.postponed_until);
    await this.taskRepository.update(postponedTask);
  }
}
