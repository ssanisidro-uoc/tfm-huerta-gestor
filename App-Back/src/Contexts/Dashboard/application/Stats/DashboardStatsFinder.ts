import { PlantingRepository } from '../../../Planting/domain/PlantingRepository';
import { UserGardenRepository } from '../../../Garden/infrastructure/persistence/UserGardenRepository';
import { PlotRepository } from '../../../Plot/domain/PlotRepository';
import { TaskRepository } from '../../../Task/domain/TaskRepository';

export interface DashboardStatsResponse {
  total_parcelas: number;
  parcelas_activas: number;
  cultivos_en_curso: number;
  tareas_pendientes: number;
  tareas_completadas: number;
  tareas_atrasadas: number;
  cosechas_proximas: number;
}

export class DashboardStatsFinder {
  constructor(
    private userGardenRepository: UserGardenRepository,
    private plantingRepository: PlantingRepository,
    private plotRepository: PlotRepository,
    private taskRepository: TaskRepository
  ) {}

  async run(userId: string): Promise<DashboardStatsResponse> {
    const userGardens = await this.userGardenRepository.find_by_user(userId);
    const gardenIds = userGardens.map(ug => ug.garden_id);

    let totalParcelas = 0;
    let parcelasActivas = 0;
    let cultivosEnCurso = 0;
    let cosechasProximas = 0;
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    for (const gardenId of gardenIds) {
      const plots = await this.plotRepository.find_by_garden(gardenId);
      totalParcelas += plots.length;
      parcelasActivas += plots.filter(p => p.is_active).length;

      const plantings = await this.plantingRepository.search_by_garden(gardenId);
      const activePlantings = plantings.filter(p => p.is_active);
      cultivosEnCurso += activePlantings.length;

      for (const planting of activePlantings) {
        const harvestDate = new Date(planting.expected_harvest_at);
        if (harvestDate >= today && harvestDate <= nextWeek) {
          cosechasProximas++;
        }
      }
    }

    let tareasPendientes = 0;
    let tareasCompletadas = 0;
    let tareasAtrasadas = 0;

    if (gardenIds.length > 0) {
      const allTasks = await this.taskRepository.find_by_gardens(gardenIds, {
        page: 1,
        limit: 1000,
        offset: 0
      });

      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      for (const task of allTasks) {
        const status = task.status;
        const scheduledDate = new Date(task.scheduled_date);

        if (status === 'completed') {
          tareasCompletadas++;
        } else if (status === 'pending') {
          if (scheduledDate < startOfToday) {
            tareasAtrasadas++;
          } else {
            tareasPendientes++;
          }
        } else if (status === 'postponed') {
          const postponeUntil = task.postponed_until ? new Date(task.postponed_until) : null;
          if (postponeUntil && postponeUntil < startOfToday) {
            tareasAtrasadas++;
          } else {
            tareasPendientes++;
          }
        }
      }
    }

    return {
      total_parcelas: totalParcelas,
      parcelas_activas: parcelasActivas,
      cultivos_en_curso: cultivosEnCurso,
      tareas_pendientes: tareasPendientes,
      tareas_completadas: tareasCompletadas,
      tareas_atrasadas: tareasAtrasadas,
      cosechas_proximas: cosechasProximas
    };
  }
}
