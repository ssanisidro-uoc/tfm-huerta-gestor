export interface CalendarTaskDTO {
  id: string;
  title: string;
  description: string | null;
  scheduled_date: Date;
  due_date: Date | null;
  status: string;
  task_type: string | null;
  task_category: string | null;
  garden_id: string;
  garden_name: string;
  plot_id: string | null;
  plot_name: string;
  planting_id: string | null;
  crop_name: string;
  priority: string;
  is_recurring: boolean;
  postponed_until: Date | null;
  postponed_reason: string | null;
  postponed_by: string | null;
}

export class GetAllCalendarTasksResponse {
  constructor(public tasks: CalendarTaskDTO[]) {}
}