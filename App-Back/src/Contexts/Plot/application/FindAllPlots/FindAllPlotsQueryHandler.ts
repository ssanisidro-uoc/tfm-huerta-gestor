import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindAllPlotsQuery } from './FindAllPlotsQuery';
import { FindAllPlotsResponse } from './FindAllPlotsResponse';
import { AllPlotsFinder } from './AllPlotsFinder';

export class FindAllPlotsQueryHandler implements QueryHandler<FindAllPlotsQuery, FindAllPlotsResponse> {
  constructor(private finder: AllPlotsFinder) {}

  subscribedTo(): Query {
    return FindAllPlotsQuery;
  }

  async handle(query: FindAllPlotsQuery): Promise<FindAllPlotsResponse> {
    const { plots, total } = await this.finder.run(query.garden_id, query.page, query.limit);
    
    return new FindAllPlotsResponse(
      plots.map(plot => ({
        id: plot.id.get_value(),
        garden_id: plot.garden_id.get_value(),
        name: plot.name.get_value(),
        code: plot.code,
        description: plot.description,
        surface_m2: plot.surface.to_persistence(),
        is_active: plot.is_active
      })),
      total,
      query.page,
      query.limit
    );
  }
}
