import { Command } from '../../../Shared/domain/Command';

export class CreateTaskCommand implements Command {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly description: string,
    readonly garden_id: string,
    readonly task_type: string,
    readonly scheduled_date: Date,
    readonly assigned_to: string | null,
    readonly due_date?: Date,
    readonly is_recurring: boolean = false,
    readonly recurrence_pattern: string | null = null
  ) {}
}
