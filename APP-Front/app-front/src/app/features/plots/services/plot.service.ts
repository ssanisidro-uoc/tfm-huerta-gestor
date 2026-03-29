import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Plot {
  id: string;
  garden_id: string;
  name: string;
  code: string | null;
  description: string | null;
  surface_m2: number;
  is_active: boolean;
}

export interface PlotDetail extends Plot {
  irrigation_type: string;
  has_water_access: boolean;
  has_greenhouse: boolean;
  has_raised_bed: boolean;
  has_mulch: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PlotsResponse {
  plots: Plot[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface CreatePlotRequest {
  name: string;
  code?: string;
  surface_m2: number;
  description?: string;
  length_m?: number;
  width_m?: number;
  shape?: string;
  position_x?: number;
  position_y?: number;
  plot_order?: number;
  soil_type?: string;
  soil_ph?: number;
  soil_quality?: string;
  soil_notes?: string;
  irrigation_type?: string;
  irrigation_flow_rate?: number;
  irrigation_notes?: string;
  has_water_access?: boolean;
  orientation?: string;
  sun_exposure_hours?: number;
  shade_level?: string;
  has_greenhouse?: boolean;
  has_raised_bed?: boolean;
  has_mulch?: boolean;
  accessibility?: string;
  restrictions?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlotService {
  private readonly API_URL = environment.apiUrl;

  private plotsSignal = signal<Plot[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly plots = this.plotsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor(private http: HttpClient) {}

  setError(message: string): void {
    this.errorSignal.set(message);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  getPlotsByGarden(gardenId: string, page = 1, limit = 20): Observable<PlotsResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<PlotsResponse>(`${this.API_URL}/api/gardens/${gardenId}/plots`, {
      params: { page: page.toString(), limit: limit.toString() }
    }).pipe(
      tap(response => {
        this.plotsSignal.set(response.plots);
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading plots');
        return of(null);
      })
    );
  }

  getPlotById(id: string): Observable<PlotDetail | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<PlotDetail>(`${this.API_URL}/api/plots/${id}`).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading plot');
        return of(null);
      })
    );
  }

  createPlot(gardenId: string, data: CreatePlotRequest): Observable<{ message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<{ message: string }>(`${this.API_URL}/api/gardens/${gardenId}/plots`, data).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error creating plot');
        return of(null);
      })
    );
  }

  updatePlot(id: string, data: Partial<CreatePlotRequest>): Observable<{ message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<{ message: string }>(`${this.API_URL}/api/plots/${id}`, data).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error updating plot');
        return of(null);
      })
    );
  }

  deletePlot(id: string): Observable<{ message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<{ message: string }>(`${this.API_URL}/api/plots/${id}`).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error deleting plot');
        return of(null);
      })
    );
  }
}
