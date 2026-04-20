import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetPlotRotationHistoryQuery } from './GetPlotRotationHistoryQuery';
import { PlotRotationHistoryResponse } from './PlotRotationHistoryResponse';
import { PlotRotationHistoryFinder } from './PlotRotationHistoryFinder';

export class GetPlotRotationHistoryQueryHandler implements QueryHandler<GetPlotRotationHistoryQuery, PlotRotationHistoryResponse> {
  constructor(private finder: PlotRotationHistoryFinder) {}

  subscribedTo(): Query {
    return GetPlotRotationHistoryQuery;
  }

  async handle(query: GetPlotRotationHistoryQuery): Promise<PlotRotationHistoryResponse> {
    return await this.finder.run(query.plotId, query.userId);
  }
}