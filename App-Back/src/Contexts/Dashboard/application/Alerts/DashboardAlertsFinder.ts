import { TaskRepository } from '../../../Task/domain/TaskRepository';
import { UserGardenRepository } from '../../../UserGarden/domain/UserGardenRepository';
import { PlantingRepository } from '../../../Planting/domain/PlantingRepository';
import { GardenRepository } from '../../../Garden/domain/GardenRepository';
import { PlotRepository } from '../../../Plot/domain/PlotRepository';
import { DashboardAlertsResponse, Alert } from './DashboardAlertsResponse';

export class DashboardAlertsFinder {
  constructor(
    private userGardenRepository: UserGardenRepository,
    private taskRepository: TaskRepository,
    private plantingRepository: PlantingRepository,
    private gardenRepository: GardenRepository,
    private plotRepository: PlotRepository
  ) {}

  async run(userId: string): Promise<DashboardAlertsResponse> {
    const userGardens = await this.userGardenRepository.find_by_user(userId);
    const gardenIds = userGardens.map(ug => ug.garden_id);

    if (gardenIds.length === 0) {
      return { alerts: [] };
    }

    const alerts: Alert[] = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const gardenNames: Record<string, string> = {};
    const plotNames: Record<string, string> = {};

    for (const gardenId of gardenIds) {
      const garden = await this.gardenRepository.search_by_id(gardenId);
      if (garden) {
        gardenNames[gardenId] = garden.name.get_value();
      }

      const plots = await this.plotRepository.find_by_garden(gardenId);
      for (const plot of plots) {
        plotNames[plot.id.get_value()] = plot.name.get_value();
      }
    }

    const allTasks = [];
    for (const gardenId of gardenIds) {
      const tasks = await this.taskRepository.search_by_garden(gardenId);
      allTasks.push(...tasks);
    }

    // 1. Tasks overdue
    for (const task of allTasks) {
      if (task.status === 'pending') {
        const scheduledDate = new Date(task.scheduled_date);
        if (scheduledDate < today) {
          const daysOverdue = Math.ceil((today.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24));
          alerts.push({
            id: `overdue-${task.id.get_value()}`,
            type: 'task_overdue',
            title: 'Tarea atrasada',
            message: `"${task.title.get_value()}" está ${daysOverdue} día(s) atrasada`,
            priority: daysOverdue > 3 ? 'high' : 'medium',
            entity_id: task.id.get_value(),
            entity_type: 'task',
            created_at: task.scheduled_date
          });
        }
      }
    }

    // 2. Plantings ready for harvest
    for (const gardenId of gardenIds) {
      const plantings = await this.plantingRepository.search_active_by_garden(gardenId);
      
      for (const planting of plantings) {
        if (planting.expected_harvest_at) {
          const harvestDate = new Date(planting.expected_harvest_at);
          const daysUntil = Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil <= 0 || (daysUntil > 0 && daysUntil <= 7)) {
            alerts.push({
              id: `harvest-${planting.id.get_value()}`,
              type: 'planting_ready',
              title: daysUntil <= 0 ? 'Cultivo listo para cosechar' : 'Cultivo próximo a cosechar',
              message: `"${planting.crop_id.get_value()}" en parcela está listo`,
              priority: daysUntil <= 0 ? 'high' : 'medium',
              entity_id: planting.id.get_value(),
              entity_type: 'planting',
              created_at: planting.expected_harvest_at
            });
          }
        }
      }
    }

    // 3. Tasks for today
    for (const task of allTasks) {
      if (task.status === 'pending') {
        const scheduledDateStr = new Date(task.scheduled_date).toISOString().split('T')[0];
        if (scheduledDateStr === todayStr) {
            alerts.push({
              id: `today-${task.id.get_value()}`,
              type: 'task_today',
              title: 'Tarea para hoy',
              message: `"${task.title.get_value()}" está programada para hoy`,
              priority: task.priority === 'high' ? 'high' : 'low',
              entity_id: task.id.get_value(),
              entity_type: 'task',
              created_at: today
            });
        }
      }
    }

    // Sort by priority
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return { alerts: alerts.slice(0, 15) };
  }
}