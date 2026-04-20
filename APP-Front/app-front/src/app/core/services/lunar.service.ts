import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TodayLunarData {
  date: string;
  moonPhase: string;
  moonPhaseEmoji: string;
  illuminationPercent: number;
  isNewMoon: boolean;
  isFullMoon: boolean;
  isFirstQuarter: boolean;
  isLastQuarter: boolean;
  zodiacSign: string;
  zodiacElement: string;
  biodynamicDayType: string;
  biodynamicQuality: string;
  isPerigee: boolean;
  isApogee: boolean;
}

export interface LunarRecommendation {
  id: string;
  title: string;
  description: string;
  agriculturalAction: string;
  cropPart: string | null;
  recommendationType: string;
  recommendationStrength: number;
  urgencyLevel: string;
  evidenceLevel: string;
}

export interface TaskRecommendation {
  id: string;
  task_id: string;
  lunar_calendar_id: string;
  lunar_rule_id: string | null;
  recommendation_type: string;
  recommendation_score: number;
  urgency_level: string;
  recommendation_title: string | null;
  recommendation_summary: string | null;
  detailed_advice: string | null;
  is_shown_to_user: boolean;
  shown_at: string | null;
  user_response: string | null;
  user_response_at: string | null;
  user_notes: string | null;
}

export interface TaskRecommendationStats {
  total: number;
  shown: number;
  followed: number;
  ignored: number;
  postponed: number;
  dismissed: number;
  avg_score: number;
}

@Injectable({ providedIn: 'root' })
export class LunarService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/lunar`;

  getTodayLunar(hemisphere = 'northern'): Observable<{ success: boolean; data: TodayLunarData }> {
    const params = new HttpParams().set('hemisphere', hemisphere);
    return this.http.get<{ success: boolean; data: TodayLunarData }>(`${this.baseUrl}/today`, { params });
  }

  getRecommendations(
    taskType: string,
    hemisphere = 'northern'
  ): Observable<{ success: boolean; data: LunarRecommendation[] }> {
    const params = new HttpParams().set('hemisphere', hemisphere);
    return this.http.get<{ success: boolean; data: LunarRecommendation[] }>(
      `${this.baseUrl}/recommendations/${taskType}`,
      { params }
    );
  }

  getTaskRecommendations(taskId: string): Observable<{ success: boolean; data: TaskRecommendation[] }> {
    return this.http.get<{ success: boolean; data: TaskRecommendation[] }>(
      `${this.baseUrl}/task/${taskId}/recommendations`
    );
  }

  markRecommendationShown(recommendationId: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(
      `${this.baseUrl}/task/recommendations/${recommendationId}/shown`,
      {}
    );
  }

  updateRecommendationResponse(
    recommendationId: string,
    response: string,
    notes?: string
  ): Observable<{ success: boolean; data: TaskRecommendation }> {
    return this.http.put<{ success: boolean; data: TaskRecommendation }>(
      `${this.baseUrl}/task/recommendations/${recommendationId}/response`,
      { userResponse: response, userNotes: notes }
    );
  }

  getTaskRecommendationStats(taskId: string): Observable<{ success: boolean; data: TaskRecommendationStats }> {
    return this.http.get<{ success: boolean; data: TaskRecommendationStats }>(
      `${this.baseUrl}/task/${taskId}/recommendations/stats`
    );
  }
}