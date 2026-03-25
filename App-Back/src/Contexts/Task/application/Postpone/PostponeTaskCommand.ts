import { Command } from '../../../Shared/domain/Command';

export class PostponeTaskCommand extends Command {
  constructor(
    readonly task_id: string,
    readonly postponed_by: string,
    readonly postponed_until: Date,
    readonly reason?: string
  ) {
    super();
  }
}
