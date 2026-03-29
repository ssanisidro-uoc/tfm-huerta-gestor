import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindPlantingsByPlotQuery } from './FindPlantingsByPlotQuery';
import { FindPlantingsByPlotResponse } from './FindPlantingsByPlotResponse';
import { PlantingsByPlotFinder } from './PlantingsByPlotFinder';

export class FindPlantingsByPlotQueryHandler implements QueryHandler<FindPlantingsByPlotQuery, FindPlantingsByPlotResponse> {
  constructor(private finder: PlantingsByPlotFinder) {}

  subscribedTo(): Query {
    return FindPlantingsByPlotQuery;
  }

  async handle(query: FindPlantingsByPlotQuery): Promise<FindPlantingsByPlotResponse> {
    const result = await this.finder.run(query.plotId, query.userId);
    return new FindPlantingsByPlotResponse(result.plantings);
  }
}
