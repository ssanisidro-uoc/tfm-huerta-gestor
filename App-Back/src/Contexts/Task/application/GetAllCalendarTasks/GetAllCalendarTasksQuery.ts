import { Query } from '../../../Shared/domain/Query';

export interface CalendarTaskFilters {
  status?: string;
  task_type?: string;
  garden_id?: string;
  plot_id?: string;
  planting_id?: string;
  crop_id?: string;
}

export class GetAllCalendarTasksQuery implements Query {
  constructor(
    readonly user_id: string,
    readonly start_date: Date,
    readonly end_date: Date,
    readonly filters?: CalendarTaskFilters
  ) {}
}