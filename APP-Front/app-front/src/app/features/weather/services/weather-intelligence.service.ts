import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface WeatherRecommendation {
  id: string;
  action: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  description: string;
  strength: number;
}

export interface WeatherAlert {
  id: string;
  gardenId: string;
  gardenName: string;
  alertType: string;
  severity: string;
  startDate: string;
  endDate: string | null;
  recommendedActions: string[];
  description: string;
}

export interface WeatherRecommendationsResponse {
  success: boolean;
  data: {
    gardenId: string;
    gardenName: string;
    location: any;
    days: number;
    forecast: any[];
    recommendations: WeatherRecommendation[];
  };
}

export interface WeatherAlertsResponse {
  success: boolean;
  data: {
    gardenId: string;
    alerts: WeatherAlert[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherIntelligenceService {
  private readonly API_URL = environment.apiUrl;
  
  private recommendationsSignal = signal<WeatherRecommendation[]>([]);
  private alertsSignal = signal<WeatherAlert[]>([]);
  private loadingSignal = signal(false);

  readonly recommendations = this.recommendationsSignal.asReadonly();
  readonly alerts = this.alertsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getWeatherRecommendations(gardenId: string, days = 7): Observable<WeatherRecommendationsResponse | null> {
    this.loadingSignal.set(true);
    
    return this.http.get<WeatherRecommendationsResponse>(
      `${this.API_URL}/api/weather/garden/${gardenId}/recommendations`,
      { params: { days: days.toString() } }
    ).pipe(
      tap(response => {
        if (response?.data?.recommendations) {
          this.recommendationsSignal.set(response.data.recommendations);
        } else {
          this.recommendationsSignal.set([]);
        }
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('Weather recommendations error:', err);
        this.recommendationsSignal.set([]);
        this.loadingSignal.set(false);
        return of(null);
      })
    );
  }

  getWeatherAlerts(gardenId: string): Observable<WeatherAlertsResponse | null> {
    return this.http.get<WeatherAlertsResponse>(
      `${this.API_URL}/api/weather/garden/${gardenId}/alerts`
    ).pipe(
      tap(response => {
        const alerts = response?.data?.alerts || [];
        this.alertsSignal.set(alerts);
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('Weather alerts error:', err);
        this.alertsSignal.set([]);
        return of(null);
      })
    );
  }

  clearAlerts(): void {
    this.alertsSignal.set([]);
  }

  clearRecommendations(): void {
    this.recommendationsSignal.set([]);
  }
}
