import { Command } from '../../../Shared/domain/Command';

export class CancelTaskCommand extends Command {
  constructor(
    readonly id: string,
    readonly cancelled_by: string,
    readonly cancellation_reason: string
  ) {
    super();
  }
}
