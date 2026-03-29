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
  status: string;
}

export interface PlantingDetail {
  id: string;
  crop_id: string;
  garden_id: string;
  plot_id: string;
  planted_at: Date;
  expected_harvest_at: Date;
  harvested_at: Date | null;
  quantity: number;
  status: string;
  crop?: {
    id: string;
    name: string;
    days_to_maturity: number;
  };
  harvest_info?: {
    total_harvest_kg?: number;
    harvest_quality?: string;
    harvest_notes?: string;
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

    return this.http.get<PlantingsResponse>(`${this.API_URL}/api/plantings`).pipe(
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

    return this.http.get<PlantingResponse>(`${this.API_URL}/api/plantings/${id}`).pipe(
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

    return this.http.get<PlantingResponse>(`${this.API_URL}/api/plantings/${id}/status`).pipe(
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

    return this.http.post<{ success: boolean; data: Planting }>(`${this.API_URL}/api/plantings`, data).pipe(
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

  harvestPlanting(
    id: string,
    harvest_date: string,
    total_harvest_kg?: number,
    harvest_quality?: string,
    harvest_notes?: string
  ): Observable<{ success: boolean } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const body: any = { harvest_date };
    if (total_harvest_kg) body.total_harvest_kg = total_harvest_kg;
    if (harvest_quality) body.harvest_quality = harvest_quality;
    if (harvest_notes) body.harvest_notes = harvest_notes;

    return this.http.post<{ success: boolean }>(`${this.API_URL}/api/plantings/${id}/harvest`, body).pipe(
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

  getPlantingsByPlot(plotId: string): Observable<{ success: boolean; data: any[] } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<{ success: boolean; data: any[] }>(`${this.API_URL}/api/plots/${plotId}/plantings`).pipe(
      tap(response => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading plot plantings');
        return of(null);
      })
    );
  }

  getArchivedPlantings(gardenId: string): Observable<{ plantings: any[] } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<{ plantings: any[] }>(`${this.API_URL}/api/gardens/${gardenId}/plantings/archived`).pipe(
      tap(response => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading archived plantings');
        return of(null);
      })
    );
  }
}
