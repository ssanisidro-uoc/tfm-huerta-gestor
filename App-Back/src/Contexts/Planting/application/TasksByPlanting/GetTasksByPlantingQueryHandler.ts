import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetTasksByPlantingQuery } from './GetTasksByPlantingQuery';
import { TasksByPlantingResponse } from './TasksByPlantingResponse';
import { TasksByPlantingFinder } from './TasksByPlantingFinder';

export class GetTasksByPlantingQueryHandler implements QueryHandler<GetTasksByPlantingQuery, TasksByPlantingResponse> {
  constructor(private finder: TasksByPlantingFinder) {}

  subscribedTo(): Query {
    return GetTasksByPlantingQuery;
  }

  async handle(query: GetTasksByPlantingQuery): Promise<TasksByPlantingResponse> {
    return await this.finder.run(query.plantingId, query.userId);
  }
}