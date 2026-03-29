import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetDashboardStatsQuery } from './GetDashboardStatsQuery';
import { DashboardStatsResponse } from './DashboardStatsResponse';
import { DashboardStatsFinder } from './DashboardStatsFinder';

export class GetDashboardStatsQueryHandler implements QueryHandler<GetDashboardStatsQuery, DashboardStatsResponse> {
  constructor(private finder: DashboardStatsFinder) {}

  subscribedTo(): Query {
    return GetDashboardStatsQuery;
  }

  async handle(query: GetDashboardStatsQuery): Promise<DashboardStatsResponse> {
    const result = await this.finder.run(query.userId);
    return new DashboardStatsResponse(
      result.total_parcelas,
      result.parcelas_activas,
      result.cultivos_en_curso,
      result.tareas_pendientes,
      result.tareas_completadas,
      result.tareas_atrasadas,
      result.cosechas_proximas
    );
  }
}
