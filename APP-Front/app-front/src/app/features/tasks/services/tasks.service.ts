import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Task {
  id: string;
  title: string;
  description: string;
  garden_id: string;
  plot_id: string | null;
  task_type: string | null;
  task_category: string | null;
  status: 'pending' | 'completed' | 'postponed';
  scheduled_date: Date;
  due_date: Date | null;
  priority: string;
  created_at: Date;
  completed_at?: Date;
  plot_name?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  postponed_until?: Date | null;
  postponed_reason?: string | null;
  postponed_by?: string | null;
}

export interface TaskStats {
  pendingToday: number;
  completedThisWeek: number;
  postponedCount: number;
  totalThisMonth: number;
}

export interface TaskResponse {
  success: boolean;
  data: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface TaskStatsResponse {
  success: boolean;
  data: TaskStats;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  garden_id: string;
  plot_id?: string;
  task_type?: string;
  task_category?: string;
  scheduled_date?: Date;
  due_date?: Date;
  priority?: string;
}

export interface Plot {
  id: string;
  name: string;
  garden_id: string;
}

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly API_URL = environment.apiUrl;

  private tasksSignal = signal<Task[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly tasks = this.tasksSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor(private http: HttpClient) {}

  setError(message: string): void {
    this.errorSignal.set(message);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  getAllTasks(
    page = 1,
    limit = 20,
    garden_id?: string,
    status?: string,
    task_type?: string
  ): Observable<TaskResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const params: any = {
      page: page.toString(),
      limit: limit.toString(),
    };
    if (garden_id) params.garden_id = garden_id;
    if (status) params.status = status;
    if (task_type) params.task_type = task_type;

    return this.http.get<TaskResponse>(`${this.API_URL}/api/tasks`, { params }).pipe(
      tap((response) => {
        this.tasksSignal.set(response.data);
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading tasks');
        return of(null);
      }),
    );
  }

  getTaskStats(): Observable<TaskStatsResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<TaskStatsResponse>(`${this.API_URL}/api/tasks/stats`).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading task stats');
        return of(null);
      }),
    );
  }

  completeTask(taskId: string): Observable<{ success: boolean; message?: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .patch<{ success: boolean; message?: string }>(`${this.API_URL}/api/tasks/${taskId}/complete`, {})
      .pipe(
        tap(() => {
          this.loadingSignal.set(false);
        }),
        catchError((err: HttpErrorResponse) => {
          this.loadingSignal.set(false);
          this.errorSignal.set(err.error?.message || 'Error completing task');
          return of(null);
        }),
      );
  }

  postponeTask(taskId: string, newDate?: Date, reason?: string): Observable<{ success: boolean; message?: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const body: any = newDate ? { postponed_until: newDate.toISOString() } : {};
    if (reason) {
      body.reason = reason;
    }

    return this.http
      .patch<{ success: boolean; message?: string }>(`${this.API_URL}/api/tasks/${taskId}/postpone`, body)
      .pipe(
        tap(() => {
          this.loadingSignal.set(false);
        }),
        catchError((err: HttpErrorResponse) => {
          this.loadingSignal.set(false);
          this.errorSignal.set(err.error?.message || 'Error postponing task');
          return of(null);
        }),
      );
  }

  createTask(data: CreateTaskRequest): Observable<{ success: boolean; message?: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .post<{ success: boolean; message?: string }>(`${this.API_URL}/api/tasks`, data)
      .pipe(
        tap(() => {
          this.loadingSignal.set(false);
        }),
        catchError((err: HttpErrorResponse) => {
          this.loadingSignal.set(false);
          this.errorSignal.set(err.error?.message || 'Error creating task');
          return of(null);
        }),
      );
  }

  getTasksByGarden(gardenId: string): Observable<{ tasks: any[] } | null> {
    return this.http.get<{ tasks: any[] }>(`${this.API_URL}/api/gardens/${gardenId}/tasks`).pipe(
      catchError((err: HttpErrorResponse) => {
        this.errorSignal.set(err.error?.message || 'Error loading tasks');
        return of(null);
      }),
    );
  }

  getTasksByPlanting(plantingId: string): Observable<any | null> {
    return this.http.get<any>(`${this.API_URL}/api/plantings/${plantingId}/tasks`).pipe(
      catchError((err: HttpErrorResponse) => {
        this.errorSignal.set(err.error?.message || 'Error loading task history');
        return of(null);
      }),
    );
  }
}