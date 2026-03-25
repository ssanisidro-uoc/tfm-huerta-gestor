import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindTaskByIdQuery } from './FindTaskByIdQuery';
import { FindTaskByIdResponse } from './FindTaskByIdResponse';
import { TaskByIdFinder } from './TaskByIdFinder';

export class FindTaskByIdQueryHandler implements QueryHandler<FindTaskByIdQuery, FindTaskByIdResponse> {
  constructor(private finder: TaskByIdFinder) {}

  subscribedTo(): Query {
    return FindTaskByIdQuery;
  }

  async handle(query: FindTaskByIdQuery): Promise<FindTaskByIdResponse> {
    const task = await this.finder.run(query.id);
    if (!task) {
      throw new Error(`Task with id ${query.id} not found`);
    }
    return new FindTaskByIdResponse(
      task.id.get_value(),
      task.title.get_value(),
      task.description,
      task.garden_id.get_value(),
      task.task_type,
      task.scheduled_date,
      task.assigned_to ? task.assigned_to.get_value() : null,
      task.due_date,
      task.completed_at,
      task.is_recurring,
      task.recurrence_pattern,
      task.status,
      task.priority
    );
  }
}
