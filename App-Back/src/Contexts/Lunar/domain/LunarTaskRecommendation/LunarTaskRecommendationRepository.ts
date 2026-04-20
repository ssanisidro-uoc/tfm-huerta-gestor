import { LunarTaskRecommendation } from './LunarTaskRecommendation';

export interface LunarTaskRecommendationRepository {
  findByTaskId(taskId: string): Promise<LunarTaskRecommendation[]>;
  findById(id: string): Promise<LunarTaskRecommendation | null>;
  save(recommendation: LunarTaskRecommendation): Promise<void>;
  update(recommendation: LunarTaskRecommendation): Promise<void>;
  delete(id: string): Promise<void>;
  getStatisticsForTask(taskId: string): Promise<{
    total: number;
    shown: number;
    followed: number;
    ignored: number;
  }>;
}