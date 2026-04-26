import { Task } from '../../domain/Task';
import { TaskRepository } from '../../domain/TaskRepository';
import { UserGardenRepository } from '../../../UserGarden/domain/UserGardenRepository';

export class GetAllCalendarTasksFinder {
  constructor(
    private taskRepository: TaskRepository,
    private userGardenRepository: UserGardenRepository
  ) {}

  async run(
    userId: string,
    startDate: Date,
    endDate: Date,
    filters?: {
      status?: string;
      task_type?: string;
      garden_id?: string;
      plot_id?: string;
      planting_id?: string;
      crop_id?: string;
    }
  ): Promise<Task[]> {
    let gardenIds: string[] = [];

    if (filters?.garden_id) {
      gardenIds = [filters.garden_id];
    } else {
      const userGardens = await this.userGardenRepository.find_by_user(userId);
      gardenIds = userGardens.map(ug => ug.garden_id);
    }

    if (gardenIds.length === 0) {
      return [];
    }

    return this.taskRepository.find_by_date_range_all(
      gardenIds,
      startDate,
      endDate,
      filters
    );
  }
}