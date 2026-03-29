import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Tasks {
  id: string;
  garden_id: string;
  name: string;
  code: string | null;
  description: string | null;
  surface_m2: number;
  is_active: boolean;
}

export interface TasksDetail extends Tasks {
  irrigation_type: string;
  has_water_access: boolean;
  has_greenhouse: boolean;
  has_raised_bed: boolean;
  has_mulch: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TasksResponse {
  tasks: Tasks[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface CreateTasksRequest {
  name: string;
  code?: string;
  surface_m2: number;
  description?: string;
  length_m?: number;
  width_m?: number;
  shape?: string;
  position_x?: number;
  position_y?: number;
  Tasks_order?: number;
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
  providedIn: 'root',
})
export class TasksService {
  private readonly API_URL = environment.apiUrl;

  private TaskssSignal = signal<Tasks[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly Taskss = this.TaskssSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor(private http: HttpClient) {}

  setError(message: string): void {
    this.errorSignal.set(message);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  getTasksByGarden(
    gardenId: string,
    page = 1,
    limit = 20,
  ): Observable<TasksResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .get<TasksResponse>(`${this.API_URL}/api/gardens/${gardenId}/tasks`, {
        params: { page: page.toString(), limit: limit.toString() },
      })
      .pipe(
        tap((response) => {
          this.TaskssSignal.set(response.tasks);
          this.loadingSignal.set(false);
        }),
        catchError((err: HttpErrorResponse) => {
          this.loadingSignal.set(false);
          this.errorSignal.set(err.error?.message || 'Error loading tasks');
          return of(null);
        }),
      );
  }

  getTasksById(id: string): Observable<TasksDetail | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<TasksDetail>(`${this.API_URL}/api/tasks/${id}`).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading Tasks');
        return of(null);
      }),
    );
  }

  createTasks(
    gardenId: string,
    data: CreateTasksRequest,
  ): Observable<{ message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .post<{
        message: string;
      }>(`${this.API_URL}/api/gardens/${gardenId}/tasks`, data)
      .pipe(
        tap(() => {
          this.loadingSignal.set(false);
        }),
        catchError((err: HttpErrorResponse) => {
          this.loadingSignal.set(false);
          this.errorSignal.set(err.error?.message || 'Error creating Tasks');
          return of(null);
        }),
      );
  }

  updateTasks(
    id: string,
    data: Partial<CreateTasksRequest>,
  ): Observable<{ message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .put<{ message: string }>(`${this.API_URL}/api/tasks/${id}`, data)
      .pipe(
        tap(() => {
          this.loadingSignal.set(false);
        }),
        catchError((err: HttpErrorResponse) => {
          this.loadingSignal.set(false);
          this.errorSignal.set(err.error?.message || 'Error updating Tasks');
          return of(null);
        }),
      );
  }

  deleteTasks(id: string): Observable<{ message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .delete<{ message: string }>(`${this.API_URL}/api/tasks/${id}`)
      .pipe(
        tap(() => {
          this.loadingSignal.set(false);
        }),
        catchError((err: HttpErrorResponse) => {
          this.loadingSignal.set(false);
          this.errorSignal.set(err.error?.message || 'Error deleting Tasks');
          return of(null);
        }),
      );
  }
}
