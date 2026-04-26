import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetAllCalendarTasksQuery } from './GetAllCalendarTasksQuery';
import { GetAllCalendarTasksResponse } from './GetAllCalendarTasksResponse';
import { GetAllCalendarTasksFinder } from './GetAllCalendarTasksFinder';

export class GetAllCalendarTasksQueryHandler implements QueryHandler<GetAllCalendarTasksQuery, GetAllCalendarTasksResponse> {
  constructor(private finder: GetAllCalendarTasksFinder) {}

  subscribedTo(): Query {
    return GetAllCalendarTasksQuery;
  }

  async handle(query: GetAllCalendarTasksQuery): Promise<GetAllCalendarTasksResponse> {
    const tasks = await this.finder.run(
      query.user_id,
      query.start_date,
      query.end_date,
      query.filters
    );
    
    return new GetAllCalendarTasksResponse(
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
        garden_name: '',
        plot_id: task.plot_id,
        plot_name: '',
        planting_id: task.planting_id,
        crop_name: '',
        priority: task.priority,
        is_recurring: task.is_recurring,
        postponed_until: task.postponed_until,
        postponed_reason: task.postponed_reason,
        postponed_by: task.postponed_by
      }))
    );
  }
}