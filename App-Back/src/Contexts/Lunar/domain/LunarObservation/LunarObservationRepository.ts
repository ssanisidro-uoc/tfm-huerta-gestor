import { LunarObservation } from './LunarObservation';

export interface LunarObservationRepository {
  findByUserId(userId: string, limit?: number, offset?: number): Promise<LunarObservation[]>;
  findByTaskId(taskId: string): Promise<LunarObservation[]>;
  findByPlantingId(plantingId: string): Promise<LunarObservation[]>;
  findById(id: string): Promise<LunarObservation | null>;
  save(observation: LunarObservation): Promise<void>;
  update(observation: LunarObservation): Promise<void>;
  delete(id: string): Promise<void>;
  getUserStatistics(userId: string): Promise<{
    totalObservations: number;
    followedAdvice: number;
    ignoredAdvice: number;
    averageOutcomeRating: number;
    averageConfidence: number;
  }>;
}