import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UnifiedIntelligence {
  taskId: string;
  gardenId: string;
  plotId?: string;
  plantingId?: string;
  lunar: LunarIntelligence | null;
  weather: WeatherIntelligence | null;
  rotation: RotationIntelligence | null;
  combinedScore: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  summary: string;
  recommendations: UnifiedRecommendation[];
}

export interface LunarIntelligence {
  moonPhase: string;
  moonAge: number;
  bestFor: string[];
  recommendations: string[];
  score: number;
}

export interface WeatherIntelligence {
  currentConditions: {
    temp: number;
    humidity: number;
    precipitation: number;
  };
  forecast: {
    date: string;
    condition: string;
    tempMin: number;
    tempMax: number;
  }[];
  alerts: {
    type: string;
    severity: string;
    description: string;
  }[];
}

export interface RotationIntelligence {
  previousCrop: string | null;
  compatibility: 'excellent' | 'good' | 'poor' | 'forbidden';
  daysSinceLastCrop: number | null;
  recommendations: string[];
}

export interface UnifiedRecommendation {
  source: 'lunar' | 'weather' | 'rotation';
  type: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  action?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UnifiedIntelligenceService {
  private readonly API_URL = environment.apiUrl;

  private intelligenceCache = signal<Map<string, UnifiedIntelligence>>(new Map());
  private loadingSignal = signal(false);

  readonly loading = this.loadingSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getIntelligenceForTask(taskId: string): Observable<UnifiedIntelligence | null> {
    return this.http.get<{ success: boolean; data: UnifiedIntelligence }>(
      `${this.API_URL}/api/tasks/${taskId}/intelligence`
    ).pipe(
      map(response => response.success ? response.data : null),
      catchError(() => of(null))
    );
  }

  getIntelligenceForGarden(gardenId: string, daysAhead: number = 7): Observable<UnifiedIntelligence[]> {
    this.loadingSignal.set(true);
    return this.http.get<{ success: boolean; data: UnifiedIntelligence[] }>(
      `${this.API_URL}/api/gardens/${gardenId}/tasks/intelligence`,
      { params: { days: daysAhead.toString() } }
    ).pipe(
      tap(() => this.loadingSignal.set(false)),
      map(response => response.success ? response.data : []),
      catchError(() => {
        this.loadingSignal.set(false);
        return of([]);
      })
    );
  }

  getCachedIntelligence(taskId: string): UnifiedIntelligence | undefined {
    return this.intelligenceCache().get(taskId);
  }

  clearCache(): void {
    this.intelligenceCache.set(new Map());
  }
}
