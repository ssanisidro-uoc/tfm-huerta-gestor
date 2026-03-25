import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindPlotByIdQuery } from './FindPlotByIdQuery';
import { FindPlotByIdResponse } from './FindPlotByIdResponse';
import { PlotByIdFinder } from './PlotByIdFinder';

export class FindPlotByIdQueryHandler implements QueryHandler<FindPlotByIdQuery, FindPlotByIdResponse> {
  constructor(private finder: PlotByIdFinder) {}

  subscribedTo(): Query {
    return FindPlotByIdQuery;
  }

  async handle(query: FindPlotByIdQuery): Promise<FindPlotByIdResponse> {
    const plot = await this.finder.run(query.id);
    if (!plot) {
      throw new Error(`Plot with id ${query.id} not found`);
    }

    return new FindPlotByIdResponse(
      plot.id.get_value(),
      plot.garden_id.get_value(),
      plot.name.get_value(),
      plot.code,
      plot.description,
      plot.surface.to_persistence(),
      plot.irrigation_type.get_value(),
      plot.has_water_access,
      plot.has_greenhouse,
      plot.has_raised_bed,
      plot.has_mulch,
      plot.is_active,
      plot.created_at,
      plot.updated_at
    );
  }
}
