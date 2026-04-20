import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WeatherAlert } from '../weather/services/weather-intelligence.service';

export interface DashboardStats {
  total_parcelas: number;
  parcelas_activas: number;
  cultivos_en_curso: number;
  tareas_pendientes: number;
  tareas_completadas: number;
  tareas_atrasadas: number;
  cosechas_proximas: number;
  // Nuevos campos para tendencias
  parcelas_nuevas_mes?: number;
  cultivos_temporada?: string;
  porcentaje_tareas_semana?: number;
  cosechas_esta_semana?: boolean;
}

export interface PlotSummary {
  id: string;
  name: string;
  garden_id: string;
  garden_name: string;
  is_active: boolean;
  surface_m2: number;
  soil_type?: string;
  last_activity: Date | null;
  status_color?: 'green' | 'orange' | 'yellow'; // estado visual de la parcela
}

export interface CropSummary {
  id: string;
  name: string;
  plot_id: string;
  plot_name: string;
  planted_at: Date;
  expected_harvest: Date;
  days_to_harvest: number;
  harvest_month?: string; // ej: 'jun', 'jul', 'ago'
  status: string;
  growth_percentage?: number; // 0-100
  emoji?: string; // emoji del cultivo
  next_task?: string; // próxima tarea pendiente
  next_task_date?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  subtitle?: string;
  plot_name?: string;
  scheduled_time?: string; // '09:00', 'Hoy', '16:30'
  type:
    | 'riego'
    | 'fitosanitario'
    | 'cosecha'
    | 'abonado'
    | 'mantenimiento'
    | 'otro';
  status: 'pending' | 'completed' | 'overdue';
  is_urgent?: boolean;
}

export interface TaskTypeStats {
  type: string;
  label: string;
  percentage: number;
  color: string;
}

export interface ActivityItem {
  type: string;
  description: string;
  date: Date;
  related_entity: string;
  emoji?: string;
  time_ago?: string; // 'Hace 45 min', 'Ayer 18:22', etc.
}

export interface AlertBanner {
  message: string;
  task_id?: string;
  severity: 'warning' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly API_URL = environment.apiUrl;

  private statsSignal = signal<DashboardStats | null>(null);
  private plotsSignal = signal<PlotSummary[]>([]);
  private cropsSignal = signal<CropSummary[]>([]);
  private activitiesSignal = signal<ActivityItem[]>([]);
  private todayTasksSignal = signal<TaskItem[]>([]);
  private taskStatsSignal = signal<TaskTypeStats[]>([]);
  private alertSignal = signal<AlertBanner | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly stats = this.statsSignal.asReadonly();
  readonly plots = this.plotsSignal.asReadonly();
  readonly crops = this.cropsSignal.asReadonly();
  readonly activities = this.activitiesSignal.asReadonly();
  readonly todayTasks = this.todayTasksSignal.asReadonly();
  readonly taskStats = this.taskStatsSignal.asReadonly();
  readonly alert = this.alertSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor(private http: HttpClient) {}

  loadDashboardData(onComplete?: () => void): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    forkJoin({
      stats: this.http.get<{ success: boolean; data: DashboardStats }>(`${this.API_URL}/api/dashboard/stats`).pipe(
        catchError(err => {
          this.errorSignal.set(err.error?.message || 'Error loading stats');
          return of({ success: false, data: null });
        })
      ),
      plots: this.http.get<{ success: boolean; data: { plots: PlotSummary[] } }>(`${this.API_URL}/api/dashboard/plots-summary`).pipe(
        catchError(() => of({ success: false, data: { plots: [] } }))
      ),
      crops: this.http.get<{ success: boolean; data: { crops: CropSummary[] } }>(`${this.API_URL}/api/dashboard/crops-summary`).pipe(
        catchError(() => of({ success: false, data: { crops: [] } }))
      ),
      activities: this.http.get<{ success: boolean; data: { activities: ActivityItem[] } }>(`${this.API_URL}/api/dashboard/recent-activity`).pipe(
        catchError(() => of({ success: false, data: { activities: [] } }))
      ),
      todayTasks: this.http.get<{ success: boolean; data: { tasks: TaskItem[] } }>(`${this.API_URL}/api/dashboard/today-tasks`).pipe(
        catchError(() => of({ success: false, data: { tasks: [] } }))
      ),
      taskStats: this.http.get<{ success: boolean; data: { stats: TaskTypeStats[] } }>(`${this.API_URL}/api/dashboard/task-stats`).pipe(
        catchError(() => of({ success: false, data: { stats: [] } }))
      ),
      alerts: this.http.get<{ success: boolean; data: AlertBanner | null }>(`${this.API_URL}/api/dashboard/alerts`).pipe(
        catchError(() => of({ success: false, data: null }))
      )
    }).subscribe({
      next: (results) => {
        if (results.stats.success && results.stats.data) {
          this.statsSignal.set(results.stats.data);
        }
        if (results.plots.success) {
          this.plotsSignal.set(results.plots.data.plots);
        }
        if (results.crops.success) {
          this.cropsSignal.set(results.crops.data.crops);
        }
        if (results.activities.success) {
          this.activitiesSignal.set(results.activities.data.activities);
        }
        if (results.todayTasks.success) {
          this.todayTasksSignal.set(results.todayTasks.data.tasks);
        }
        if (results.taskStats.success) {
          this.taskStatsSignal.set(results.taskStats.data.stats);
        }
        if (results.alerts.success) {
          this.alertSignal.set(results.alerts.data);
        }
        this.loadingSignal.set(false);
        if (onComplete) {
          onComplete();
        }
      },
      error: (err) => {
        this.loadingSignal.set(false);
        this.errorSignal.set('Error loading dashboard data');
        if (onComplete) {
          onComplete();
        }
      }
    });
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  dismissAlert(): void {
    this.alertSignal.set(null);
  }

  /** Devuelve los cultivos de una parcela concreta */
  getCropsForPlot(plotId: string): CropSummary[] {
    return this.cropsSignal().filter((c) => c.plot_id === plotId);
  }

  /** Número de tareas pendientes hoy */
  getPendingTasksCount(): number {
    return this.todayTasksSignal().filter((t) => t.status === 'pending').length;
  }
}
