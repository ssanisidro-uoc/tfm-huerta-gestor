import { UserGardenRepository } from '../../../UserGarden/domain/UserGardenRepository';
import { FindGardenCollaboratorsResponse } from './FindGardenCollaboratorsResponse';

export class GardenCollaboratorsFinder {
  constructor(private repository: UserGardenRepository) {}

  async run(gardenId: string): Promise<FindGardenCollaboratorsResponse> {
    const collaborators = await this.repository.find_collaborators_by_garden(gardenId);
    return new FindGardenCollaboratorsResponse(collaborators);
  }
}