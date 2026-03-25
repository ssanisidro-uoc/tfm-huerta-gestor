import { Query } from '../../../Shared/domain/Query';

export class FindTaskByIdQuery implements Query {
  constructor(readonly id: string) {}
}
