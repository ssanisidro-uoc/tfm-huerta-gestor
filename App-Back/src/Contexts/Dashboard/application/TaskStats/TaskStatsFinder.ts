import { UserGardenRepository } from '../../../Garden/infrastructure/persistence/UserGardenRepository';
import { TaskRepository } from '../../../Task/domain/TaskRepository';

export interface TaskStatItem {
  type: string;
  label: string;
  percentage: number;
  color: string;
}

export interface TaskStatsResponse {
  stats: TaskStatItem[];
}

const TASK_TYPE_LABELS: Record<string, string> = {
  'watering': 'Riegos',
  'fertilizing': 'Fertilización',
  'sowing': 'Siembra',
  'harvesting': 'Cosecha',
  'maintenance': 'Mantenimiento',
  'treatment': 'Tratamiento',
  'weeding': 'Desmaleze',
  'pruning': 'Poda',
  'thinning': 'Aclareo',
};

const TASK_TYPE_COLORS: Record<string, string> = {
  'watering': '#2196f3',
  'fertilizing': '#8bc34a',
  'sowing': '#4caf50',
  'harvesting': '#ff9800',
  'maintenance': '#9e9e9e',
  'treatment': '#f44336',
  'weeding': '#795548',
  'pruning': '#9c27b0',
  'thinning': '#607d8b',
};

export class TaskStatsFinder {
  constructor(
    private userGardenRepository: UserGardenRepository,
    private taskRepository: TaskRepository
  ) {}

  async run(userId: string): Promise<TaskStatsResponse> {
    const userGardens = await this.userGardenRepository.find_by_user(userId);
    const gardenIds = userGardens.map(ug => ug.garden_id);

    const typeCounts: Record<string, number> = {};
    let totalTasks = 0;

    for (const gardenId of gardenIds) {
      const tasks = await this.taskRepository.search_by_garden(gardenId);
      totalTasks += tasks.length;

      for (const task of tasks) {
        const taskType = task.task_type || 'other';
        typeCounts[taskType] = (typeCounts[taskType] || 0) + 1;
      }
    }

    const stats: TaskStatItem[] = Object.entries(typeCounts)
      .map(([type, count]) => ({
        type,
        label: TASK_TYPE_LABELS[type] || type,
        percentage: totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0,
        color: TASK_TYPE_COLORS[type] || '#607d8b'
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return { stats };
  }
}