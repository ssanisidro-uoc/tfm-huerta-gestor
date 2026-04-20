import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindGardenCollaboratorsQuery } from './FindGardenCollaboratorsQuery';
import { FindGardenCollaboratorsResponse } from './FindGardenCollaboratorsResponse';
import { UserGardenRepository } from '../../../UserGarden/domain/UserGardenRepository';

export class FindGardenCollaboratorsQueryHandler implements QueryHandler<FindGardenCollaboratorsQuery, FindGardenCollaboratorsResponse> {
  constructor(private repository: UserGardenRepository) {}

  subscribedTo(): Query {
    return FindGardenCollaboratorsQuery;
  }

  async handle(query: FindGardenCollaboratorsQuery): Promise<FindGardenCollaboratorsResponse> {
    const collaborators = await this.repository.find_collaborators_by_garden(query.garden_id);
    
    return new FindGardenCollaboratorsResponse(collaborators);
  }
}