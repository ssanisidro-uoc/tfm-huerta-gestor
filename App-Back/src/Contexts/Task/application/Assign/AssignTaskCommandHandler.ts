import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { AssignTaskCommand } from './AssignTaskCommand';
import { TaskAssigner } from './TaskAssigner';

export class AssignTaskCommandHandler implements CommandHandler<AssignTaskCommand> {
  constructor(private assigner: TaskAssigner) {}

  subscribedTo(): Command {
    return AssignTaskCommand;
  }

  async handle(command: AssignTaskCommand): Promise<void> {
    await this.assigner.run(command.id, {
      assigned_to: command.assigned_to,
      assigned_by: command.assigned_by
    });
  }
}
