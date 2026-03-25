import { Command } from '../../../Shared/domain/Command';

export class CreateManualTaskCommand extends Command {
  constructor(
    readonly id: string,
    readonly garden_id: string,
    readonly plot_id: string | null,
    readonly planting_id: string | null,
    readonly task_type: string,
    readonly task_category: string | null,
    readonly title: string,
    readonly description: string | null,
    readonly scheduled_date: Date,
    readonly due_date: Date | null,
    readonly estimated_duration_minutes: number | null,
    readonly priority: string,
    readonly created_by: string
  ) {
    super();
  }
}
