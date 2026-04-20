import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CropDetail } from './crop.service';

export interface DuplicateCheckResult {
  exists: boolean;
  field: string;
}

export interface CreateCropDto {
  name: string;
  scientific_name: string;
  family: string;
  category: string;
  lifecycle?: string;
  growth_habit?: string;
  days_to_harvest_min?: number;
  days_to_harvest_max?: number;
  days_to_germination?: number;
  min_temperature_c?: number;
  max_temperature_c?: number;
  optimal_temperature_min_c?: number;
  optimal_temperature_max_c?: number;
  frost_tolerant?: boolean;
  heat_tolerant?: boolean;
  sun_requirement?: string;
  min_sun_hours?: number;
  shade_tolerance?: string;
  preferred_soil_types?: string[];
  min_soil_ph?: number;
  max_soil_ph?: number;
  soil_depth_requirement?: string;
  soil_fertility_requirement?: string;
  water_requirement?: string;
  drought_tolerant?: boolean;
  waterlogging_tolerant?: boolean;
  recommended_spacing_cm?: number;
  recommended_row_spacing_cm?: number;
  seed_depth_cm?: number;
  sowing_start_month?: number;
  sowing_end_month?: number;
  harvest_start_month?: number;
  harvest_end_month?: number;
  companion_crops?: string[];
  incompatible_crops?: string[];
  rotation_group?: string;
  years_before_replant?: number;
  common_pests?: Record<string, string[]>;
  common_diseases?: Record<string, string[]>;
  pest_resistance_level?: string;
  nitrogen_fixer?: boolean;
  attracts_pollinators?: boolean;
  attracts_beneficial_insects?: boolean;
  average_yield_kg_per_m2?: number;
  harvest_type?: string;
  preferred_moon_phase?: string;
  biodynamic_type?: string;
  description?: string;
  growing_tips?: string;
  culinary_uses?: string;
  nutritional_info?: Record<string, string>;
}

export interface UpdateCropDto extends Partial<CreateCropDto> {}

export interface CropApiResponse {
  id: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminCropService {
  private readonly API_URL = environment.apiUrl;

  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  private successSignal = signal<string | null>(null);

  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly success = this.successSignal.asReadonly();

  constructor(private http: HttpClient) {}

  createCrop(crop: CreateCropDto): Observable<CropApiResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.successSignal.set(null);

    return this.http.post<CropApiResponse>(`${this.API_URL}/api/admin/crops`, crop).pipe(
      tap(response => {
        this.loadingSignal.set(false);
        this.successSignal.set('Cultivo creado correctamente');
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error al crear el cultivo');
        return of(null);
      })
    );
  }

  updateCrop(id: string, crop: UpdateCropDto): Observable<CropApiResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.successSignal.set(null);

    return this.http.put<CropApiResponse>(`${this.API_URL}/api/admin/crops/${id}`, crop).pipe(
      tap(response => {
        this.loadingSignal.set(false);
        this.successSignal.set('Cultivo actualizado correctamente');
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error al actualizar el cultivo');
        return of(null);
      })
    );
  }

  deleteCrop(id: string): Observable<CropApiResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.successSignal.set(null);

    return this.http.delete<CropApiResponse>(`${this.API_URL}/api/admin/crops/${id}`).pipe(
      tap(response => {
        this.loadingSignal.set(false);
        this.successSignal.set('Cultivo eliminado correctamente');
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error al eliminar el cultivo');
        return of(null);
      })
    );
  }

  clearMessages(): void {
    this.errorSignal.set(null);
    this.successSignal.set(null);
  }

  setError(message: string): void {
    this.errorSignal.set(message);
  }

  checkDuplicate(name: string, scientificName?: string): Observable<DuplicateCheckResult | null> {
    const params = new URLSearchParams();
    params.set('name', name);
    if (scientificName) {
      params.set('scientific_name', scientificName);
    }

    return this.http.get<DuplicateCheckResult>(`${this.API_URL}/api/admin/crops/check?${params.toString()}`).pipe(
      tap(response => {
        if (response?.exists) {
          if (response.field === 'name') {
            this.errorSignal.set('Ya existe un cultivo con ese nombre');
          } else {
            this.errorSignal.set('Ya existe un cultivo con ese nombre científico');
          }
        }
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.errorSignal.set(err.error?.error || 'El cultivo ya existe');
          return of({ exists: true, field: err.error?.field || 'name' });
        }
        return of(null);
      })
    );
  }
}
