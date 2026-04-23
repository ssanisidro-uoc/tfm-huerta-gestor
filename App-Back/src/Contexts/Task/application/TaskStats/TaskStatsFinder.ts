import { UserGardenRepository } from '../../../Garden/infrastructure/persistence/UserGardenRepository';
import { TaskRepository } from '../../domain/TaskRepository';

export interface TaskStatsData {
  pendingToday: number;
  completedThisWeek: number;
  postponedCount: number;
  totalThisMonth: number;
}

export interface TaskStatsResponse {
  success: boolean;
  data: TaskStatsData;
}

export class TaskStatsFinder {
  constructor(
    private userGardenRepository: UserGardenRepository,
    private taskRepository: TaskRepository
  ) {}

  async run(userId: string): Promise<TaskStatsResponse> {
    const userGardens = await this.userGardenRepository.find_by_user(userId);
    const gardenIds = userGardens.map(ug => ug.garden_id);

    if (gardenIds.length === 0) {
      return {
        success: true,
        data: {
          pendingToday: 0,
          completedThisWeek: 0,
          postponedCount: 0,
          totalThisMonth: 0
        }
      };
    }

    const allTasks = await this.taskRepository.find_by_gardens(gardenIds);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(today.getDate() + diffToMonday);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    let pendingToday = 0;
    let completedThisWeek = 0;
    let postponedCount = 0;
    let totalThisMonth = 0;

    for (const task of allTasks) {
      const scheduledDate = new Date(task.scheduled_date);
      const effectiveDate = task.postponed_until ? new Date(task.postponed_until) : scheduledDate;

      if (task.status === 'postponed') {
        postponedCount++;
      }

      if (effectiveDate >= startOfMonth && effectiveDate <= endOfMonth) {
        totalThisMonth++;
      }

      if (task.status === 'pending' && effectiveDate >= today && effectiveDate < tomorrow) {
        pendingToday++;
      }

      if (task.status === 'completed' && task.completed_at) {
        const completedDate = new Date(task.completed_at);
        if (completedDate >= startOfWeek && completedDate < tomorrow) {
          completedThisWeek++;
        }
      }
    }

    return {
      success: true,
      data: {
        pendingToday,
        completedThisWeek,
        postponedCount,
        totalThisMonth
      }
    };
  }
}
