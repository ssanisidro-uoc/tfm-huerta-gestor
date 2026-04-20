import { TaskRepository } from '../../../Task/domain/TaskRepository';
import { UserGardenRepository } from '../../../UserGarden/domain/UserGardenRepository';
import { GardenRepository } from '../../../Garden/domain/GardenRepository';
import { PlotRepository } from '../../../Plot/domain/PlotRepository';
import { DashboardTodayTasksResponse, TodayTask } from './DashboardTodayTasksResponse';

export class DashboardTodayTasksFinder {
  constructor(
    private userGardenRepository: UserGardenRepository,
    private taskRepository: TaskRepository,
    private gardenRepository: GardenRepository,
    private plotRepository: PlotRepository
  ) {}

  async run(userId: string): Promise<DashboardTodayTasksResponse> {
    const userGardens = await this.userGardenRepository.find_by_user(userId);
    const gardenIds = userGardens.map(ug => ug.garden_id);

    if (gardenIds.length === 0) {
      return { tasks: [] };
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const tasks: TodayTask[] = [];
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

      const tasksByGarden = await this.taskRepository.find_by_date_range(
        gardenId,
        startOfDay,
        endOfDay,
        { status: 'pending' }
      );

      for (const task of tasksByGarden) {
        if (task.status === 'pending' || task.status === 'postponed') {
          tasks.push({
            id: task.id.get_value(),
            title: task.title.get_value(),
            description: task.description || null,
            task_type: task.task_type,
            status: task.status,
            scheduled_date: task.scheduled_date,
            priority: task.priority,
            garden_name: gardenNames[gardenId] || null,
            plot_name: task.plot_id ? plotNames[task.plot_id] || null : null
          });
        }
      }
    }

    tasks.sort((a, b) => {
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      const priorityA = priorityOrder[a.priority] ?? 3;
      const priorityB = priorityOrder[b.priority] ?? 3;
      return priorityA - priorityB || new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
    });

    return { tasks: tasks.slice(0, 10) };
  }
}