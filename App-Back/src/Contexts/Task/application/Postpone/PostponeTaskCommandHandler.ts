import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { PostponeTaskCommand } from './PostponeTaskCommand';
import { TaskPostponer } from './TaskPostponer';

export class PostponeTaskCommandHandler implements CommandHandler<PostponeTaskCommand> {
  constructor(private postponer: TaskPostponer) {}

  subscribedTo(): Command {
    return PostponeTaskCommand;
  }

  async handle(command: PostponeTaskCommand): Promise<void> {
    await this.postponer.run(command.task_id, {
      postponed_by: command.postponed_by,
      reason: command.reason,
      postponed_until: command.postponed_until
    });
  }
}
