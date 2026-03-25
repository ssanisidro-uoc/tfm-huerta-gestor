import { Query } from '../../../Shared/domain/Query';

export class FindGardenByIdQuery implements Query {
  constructor(readonly id: string) {}
}
