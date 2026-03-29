import { Query } from '../../../Shared/domain/Query';

export class FindPlantingsByPlotQuery extends Query {
  constructor(
    public readonly plotId: string,
    public readonly userId: string
  ) {
    super();
  }
}
