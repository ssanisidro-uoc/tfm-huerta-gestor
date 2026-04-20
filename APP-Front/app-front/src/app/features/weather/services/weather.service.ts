import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface WeatherLocation {
  id: string;
  latitude: number;
  longitude: number;
  locationName: string | null;
  city: string | null;
  region: string | null;
  country: string;
  timezone: string;
  climateZone: string | null;
}

export interface WeatherData {
  date: string;
  tempMax: number;
  tempMin: number;
  tempAvg: number;
  precipitationProbability: number;
  precipitationSum: number;
  weatherCode: number;
  weatherDescription: string;
  windSpeedMax: number;
  humidityMax: number;
  humidityMin: number;
  et0: number;
}

export interface IrrigationRecommendation {
  status: 'skip' | 'reduce' | 'normal' | 'increase';
  message: string;
  reason: string;
  suggestedAmountMm: number;
}

export interface GardenWeather {
  gardenId: string;
  gardenName: string;
  location: WeatherLocation;
  forecast: WeatherData[];
  irrigationRecommendation: string;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly API_URL = environment.apiUrl;

  private weatherSignal = signal<WeatherData[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  private irrigationSignal = signal<IrrigationRecommendation | null>(null);

  readonly weather = this.weatherSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly irrigation = this.irrigationSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getWeatherLocations(): Observable<{ success: boolean; data: WeatherLocation[] } | null> {
    return this.http.get<{ success: boolean; data: WeatherLocation[] }>(`${this.API_URL}/api/weather/locations`).pipe(
      catchError((err: HttpErrorResponse) => {
        this.errorSignal.set(err.error?.message || 'Error loading weather locations');
        return of(null);
      })
    );
  }

  getGardenWeather(gardenId: string): Observable<{ success: boolean; data: GardenWeather } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<{ success: boolean; data: GardenWeather }>(`${this.API_URL}/api/weather/garden/${gardenId}`).pipe(
      tap(response => {
        if (response.success) {
          this.weatherSignal.set(response.data.forecast);
        }
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading weather data');
        return of(null);
      })
    );
  }

  getWeatherForecast(locationId: string, days: number = 14): Observable<{ success: boolean; data: { forecast: WeatherData[]; irrigation: IrrigationRecommendation } } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<{ success: boolean; data: { forecast: WeatherData[]; irrigation: IrrigationRecommendation } }>(
      `${this.API_URL}/api/weather/forecast/${locationId}`,
      { params: { days: days.toString() } }
    ).pipe(
      tap(response => {
        if (response.success) {
          this.weatherSignal.set(response.data.forecast);
          this.irrigationSignal.set(response.data.irrigation);
        }
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading forecast');
        return of(null);
      })
    );
  }

  syncWeather(locationId: string): Observable<{ success: boolean; message?: string } | null> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.API_URL}/api/weather/sync/${locationId}`, {}).pipe(
      tap(response => {
        if (response.success) {
          console.log('Weather synced successfully');
        }
      }),
      catchError((err: HttpErrorResponse) => {
        this.errorSignal.set(err.error?.message || 'Error syncing weather');
        return of(null);
      })
    );
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}