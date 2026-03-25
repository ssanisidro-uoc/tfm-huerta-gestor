import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindAllTasksQuery } from './FindAllTasksQuery';
import { FindAllTasksResponse } from './FindAllTasksResponse';
import { AllTasksFinder } from './AllTasksFinder';

export class FindAllTasksQueryHandler implements QueryHandler<FindAllTasksQuery, FindAllTasksResponse> {
  constructor(private finder: AllTasksFinder) {}

  subscribedTo(): Query {
    return FindAllTasksQuery;
  }

  async handle(query: FindAllTasksQuery): Promise<FindAllTasksResponse> {
    const { tasks, total } = await this.finder.run(query.garden_id, query.page, query.limit, query.filters);
    
    return new FindAllTasksResponse(
      tasks.map(task => ({
        id: task.id.get_value(),
        title: task.title.get_value(),
        description: task.description,
        garden_id: task.garden_id.get_value(),
        status: task.status,
        task_type: task.task_type,
        scheduled_date: task.scheduled_date,
        due_date: task.due_date
      })),
      total,
      query.page,
      query.limit
    );
  }
}
