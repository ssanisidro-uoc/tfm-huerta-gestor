import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Planting {
  id: string;
  crop_id: string;
  garden_id: string;
  plot_id: string;
  planted_at: Date;
  expected_harvest_at: Date;
  quantity: number;
  unit: string;
  status: string;
}

export interface PlantingDetail extends Planting {
  crop?: {
    id: string;
    name: string;
    days_to_maturity: number;
  };
  phenological?: {
    phase: string;
    progress: number;
    description: string;
    days_elapsed: number;
    days_to_harvest: number;
    days_until_harvest_text: string;
  };
  actions?: string[];
}

export interface PlantingsResponse {
  plantings: Planting[];
}

export interface PlantingResponse {
  success: boolean;
  data: PlantingDetail;
}

export interface CreatePlantingRequest {
  crop_id: string;
  garden_id: string;
  plot_id: string;
  planted_at: string;
  quantity?: number;
  unit?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlantingService {
  private readonly API_URL = environment.apiUrl;

  private plantingsSignal = signal<Planting[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly plantings = this.plantingsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getPlantings(): Observable<PlantingsResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<PlantingsResponse>(`${this.API_URL}/plantings`).pipe(
      tap(response => {
        this.plantingsSignal.set(response.plantings);
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading plantings');
        return of(null);
      })
    );
  }

  getPlantingById(id: string): Observable<PlantingResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<PlantingResponse>(`${this.API_URL}/plantings/${id}`).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading planting');
        return of(null);
      })
    );
  }

  getPlantingStatus(id: string): Observable<PlantingResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<PlantingResponse>(`${this.API_URL}/plantings/${id}/status`).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading planting status');
        return of(null);
      })
    );
  }

  createPlanting(data: CreatePlantingRequest): Observable<{ success: boolean; data: Planting } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<{ success: boolean; data: Planting }>(`${this.API_URL}/plantings`, data).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error creating planting');
        return of(null);
      })
    );
  }

  harvestPlanting(id: string, harvested_at: string): Observable<{ success: boolean } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<{ success: boolean }>(`${this.API_URL}/plantings/${id}/harvest`, { harvested_at }).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error harvesting planting');
        return of(null);
      })
    );
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}
