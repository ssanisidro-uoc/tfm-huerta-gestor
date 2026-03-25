import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { CancelTaskCommand } from './CancelTaskCommand';
import { TaskCanceller } from './TaskCanceller';

export class CancelTaskCommandHandler implements CommandHandler<CancelTaskCommand> {
  constructor(private canceller: TaskCanceller) {}

  subscribedTo(): Command {
    return CancelTaskCommand;
  }

  async handle(command: CancelTaskCommand): Promise<void> {
    await this.canceller.run(command.id, {
      cancelled_by: command.cancelled_by,
      cancellation_reason: command.cancellation_reason
    });
  }
}
