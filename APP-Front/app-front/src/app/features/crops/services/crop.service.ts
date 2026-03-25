import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Crop {
  id: string;
  name: string;
  scientific_name: string;
  family: string;
  category: string;
  days_to_harvest_min: number;
  days_to_harvest_max: number;
  sun_requirement: string;
  water_requirement: string;
}

export interface CropDetail extends Crop {
  description: string;
  frost_tolerant: boolean;
  heat_tolerant: boolean;
  min_temperature_c: number;
  max_temperature_c: number;
  preferred_soil_types: string[];
  companion_crops: string[];
}

export interface CropsResponse {
  crops: Crop[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CropService {
  private readonly API_URL = environment.apiUrl;

  private cropsSignal = signal<Crop[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly crops = this.cropsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getCrops(page = 1, limit = 50, category?: string, family?: string): Observable<CropsResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString()
    };
    if (category) params['category'] = category;
    if (family) params['family'] = family;

    return this.http.get<CropsResponse>(`${this.API_URL}/crops`, { params }).pipe(
      tap(response => {
        this.cropsSignal.set(response.crops);
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading crops');
        return of(null);
      })
    );
  }

  getCropById(id: string): Observable<CropDetail | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<CropDetail>(`${this.API_URL}/crops/${id}`).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading crop');
        return of(null);
      })
    );
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}
