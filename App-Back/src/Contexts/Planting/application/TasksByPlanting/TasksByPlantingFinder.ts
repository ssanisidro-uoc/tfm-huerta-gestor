import { PlantingRepository } from '../../domain/PlantingRepository';
import { UserGardenRepository } from '../../../UserGarden/domain/UserGardenRepository';
import { TaskRepository } from '../../../Task/domain/TaskRepository';
import { GardenRepository } from '../../../Garden/domain/GardenRepository';
import { PlotRepository } from '../../../Plot/domain/PlotRepository';
import { TasksByPlantingResponse, TaskHistoryItem } from './TasksByPlantingResponse';

export class TasksByPlantingFinder {
  constructor(
    private plantingRepository: PlantingRepository,
    private userGardenRepository: UserGardenRepository,
    private taskRepository: TaskRepository,
    private gardenRepository: GardenRepository,
    private plotRepository: PlotRepository
  ) {}

  async run(plantingId: string, userId: string): Promise<TasksByPlantingResponse> {
    const planting = await this.plantingRepository.search_by_id(plantingId);
    if (!planting) {
      throw new Error('Planting not found');
    }

    const hasAccess = await this.userGardenRepository.has_permission(userId, planting.garden_id.get_value(), 'viewer');
    if (!hasAccess) {
      throw new Error('Access denied to this garden');
    }

    const garden = await this.gardenRepository.search_by_id(planting.garden_id.get_value());
    const gardenName = garden?.name.get_value() || 'Huerta';

    const plot = await this.plotRepository.search_by_id(planting.plot_id);
    const plotName = plot?.name.get_value() || 'Parcela';

    const allTasks = await this.taskRepository.search_by_garden(planting.garden_id.get_value());
    const plantingTasks = allTasks.filter(t => t.planting_id === plantingId);

    const tasks: TaskHistoryItem[] = plantingTasks.map(task => ({
      task_id: task.id.get_value(),
      title: task.title.get_value(),
      task_type: task.task_type,
      task_category: task.task_category,
      status: task.status,
      priority: task.priority,
      scheduled_date: task.scheduled_date.toISOString(),
      due_date: task.due_date ? task.due_date.toISOString() : null,
      completed_at: task.completed_at ? task.completed_at.toISOString() : null,
      completed_by: task.completed_by,
      postponed_at: task.postponed_at ? task.postponed_at.toISOString() : null,
      postponed_until: task.postponed_until ? task.postponed_until.toISOString() : null,
      postponed_reason: task.postponed_reason,
      cancellation_reason: task.cancellation_reason,
      created_at: task.created_at.toISOString()
    }));

    return {
      planting_id: planting.id.get_value(),
      crop_name: planting.crop_id.get_value(),
      plot_name: plotName,
      garden_name: gardenName,
      tasks
    };
  }
}