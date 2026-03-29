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

export interface CropDetail {
  id: string;
  name: string;
  scientific_name: string;
  family: string;
  category: string;
  lifecycle: string;
  growth_habit: string;
  days_to_harvest_min: number;
  days_to_harvest_max: number;
  days_to_germination: number;
  min_temperature_c: number;
  max_temperature_c: number;
  optimal_temperature_min_c: number;
  optimal_temperature_max_c: number;
  frost_tolerant: boolean;
  heat_tolerant: boolean;
  sun_requirement: string;
  min_sun_hours: number;
  shade_tolerance: string;
  preferred_soil_types: string[];
  min_soil_ph: number;
  max_soil_ph: number;
  soil_depth_requirement: string;
  soil_fertility_requirement: string;
  water_requirement: string;
  drought_tolerant: boolean;
  waterlogging_tolerant: boolean;
  recommended_spacing_cm: number;
  recommended_row_spacing_cm: number;
  seed_depth_cm: number;
  sowing_start_month: number;
  sowing_end_month: number;
  harvest_start_month: number;
  harvest_end_month: number;
  companion_crops: string[];
  incompatible_crops: string[];
  rotation_group: string;
  years_before_replant: number;
  common_pests: any;
  common_diseases: any;
  pest_resistance_level: string;
  nitrogen_fixer: boolean;
  attracts_pollinators: boolean;
  attracts_beneficial_insects: boolean;
  average_yield_kg_per_m2: number;
  harvest_type: string;
  preferred_moon_phase: string;
  biodynamic_type: string;
  description: string;
  growing_tips: string;
  culinary_uses: string;
  nutritional_info: any;
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

  getCrops(page = 1, limit = 50, category?: string, family?: string, search?: string): Observable<CropsResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString()
    };
    if (category) params['category'] = category;
    if (family) params['family'] = family;
    if (search) params['search'] = search;

    return this.http.get<CropsResponse>(`${this.API_URL}/api/crops`, { params }).pipe(
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

    return this.http.get<CropDetail>(`${this.API_URL}/api/crops/${id}`).pipe(
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
