export class FindTaskByIdResponse {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly description: string,
    readonly garden_id: string,
    readonly task_type: string,
    readonly scheduled_date: Date,
    readonly assigned_to: string | null,
    readonly due_date: Date | null,
    readonly completed_at: Date | null,
    readonly is_recurring: boolean,
    readonly recurrence_pattern: string | null,
    readonly status: string,
    readonly priority: string
  ) {}
}
