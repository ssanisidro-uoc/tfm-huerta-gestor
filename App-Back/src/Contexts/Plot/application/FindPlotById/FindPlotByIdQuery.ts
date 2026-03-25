import { Query } from '../../../Shared/domain/Query';

export class FindPlotByIdQuery implements Query {
  constructor(readonly id: string) {}
}
