import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { TasksByPlantingQuery } from './TasksByPlantingQuery';
import { TasksByPlantingResponse, TaskUserInfo } from './TasksByPlantingResponse';
import { TaskRepository } from '../../domain/TaskRepository';
import { PlotRepository } from '../../../Plot/domain/PlotRepository';
import { PostgresUserRepository } from '../../../User/infrastructure/persistence/PostgresUserRepository';

export class TasksByPlantingQueryHandler implements QueryHandler<TasksByPlantingQuery, TasksByPlantingResponse> {
  constructor(
    private taskRepository: TaskRepository,
    private plotRepository: PlotRepository,
    private userRepository: PostgresUserRepository
  ) {}

  subscribedTo(): Query {
    return TasksByPlantingQuery;
  }

  private async getUserInfo(userId: string | null): Promise<TaskUserInfo | null> {
    if (!userId) return null;
    try {
      const user = await this.userRepository.search_by_id(userId);
      if (user) {
        return {
          id: user.id.get_value(),
          name: user.name,
          email: user.email.get_value()
        };
      }
    } catch (e) {
      // User not found
    }
    return null;
  }

  async handle(query: TasksByPlantingQuery): Promise<TasksByPlantingResponse> {
    const tasks = await this.taskRepository.find_by_planting(query.planting_id);
    
    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        let plotName: string | null = null;
        if (task.plot_id) {
          try {
            const plot = await this.plotRepository.search_by_id(task.plot_id);
            plotName = plot?.name.get_value() || null;
          } catch (e) {
            // Plot not found
          }
        }
        
        const [completedBy, cancelledBy, postponedBy] = await Promise.all([
          this.getUserInfo(task.completed_by),
          this.getUserInfo(task.cancelled_by),
          this.getUserInfo(task.postponed_by)
        ]);
        
        return {
          id: task.id.get_value(),
          title: task.title.get_value(),
          description: task.description,
          scheduled_date: task.scheduled_date,
          status: task.status,
          task_type: task.task_type,
          plot_name: plotName,
          completed_by: completedBy,
          cancelled_by: cancelledBy,
          postponed_by: postponedBy,
          completed_at: task.completed_at,
          cancelled_at: task.cancelled_at,
          postponed_at: task.postponed_at,
          postponed_until: task.postponed_until,
          postponed_reason: task.postponed_reason,
          cancellation_reason: task.cancellation_reason
        };
      })
    );

    return new TasksByPlantingResponse(tasksWithDetails);
  }
}