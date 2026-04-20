import { Query } from '../../../Shared/domain/Query';

export class FindGardenCollaboratorsQuery implements Query {
  constructor(readonly garden_id: string) {}
}