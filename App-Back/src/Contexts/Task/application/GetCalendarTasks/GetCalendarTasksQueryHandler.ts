import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetCalendarTasksQuery } from './GetCalendarTasksQuery';
import { GetCalendarTasksResponse } from './GetCalendarTasksResponse';
import { CalendarTasksFinder } from './CalendarTasksFinder';

export class GetCalendarTasksQueryHandler implements QueryHandler<GetCalendarTasksQuery, GetCalendarTasksResponse> {
  constructor(private finder: CalendarTasksFinder) {}

  subscribedTo(): Query {
    return GetCalendarTasksQuery;
  }

  async handle(query: GetCalendarTasksQuery): Promise<GetCalendarTasksResponse> {
    const tasks = await this.finder.run(query.garden_id, query.start_date, query.end_date, query.filters);
    
    return new GetCalendarTasksResponse(
      tasks.map(task => ({
        id: task.id.get_value(),
        title: task.title.get_value(),
        description: task.description,
        scheduled_date: task.scheduled_date,
        due_date: task.due_date,
        status: task.status,
        task_type: task.task_type,
        task_category: task.task_category,
        garden_id: task.garden_id.get_value(),
        plot_id: task.plot_id,
        planting_id: task.planting_id,
        priority: task.priority,
        is_recurring: task.is_recurring,
        postponed_until: task.postponed_until,
        postponed_reason: task.postponed_reason,
        postponed_by: task.postponed_by
      }))
    );
  }
}
