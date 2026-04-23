import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindGardenCollaboratorsQuery } from './FindGardenCollaboratorsQuery';
import { FindGardenCollaboratorsResponse } from './FindGardenCollaboratorsResponse';
import { GardenCollaboratorsFinder } from './GardenCollaboratorsFinder';

export class FindGardenCollaboratorsQueryHandler implements QueryHandler<FindGardenCollaboratorsQuery, FindGardenCollaboratorsResponse> {
  constructor(private finder: GardenCollaboratorsFinder) {}

  subscribedTo(): Query {
    return FindGardenCollaboratorsQuery;
  }

  async handle(query: FindGardenCollaboratorsQuery): Promise<FindGardenCollaboratorsResponse> {
    return this.finder.run(query.garden_id);
  }
}