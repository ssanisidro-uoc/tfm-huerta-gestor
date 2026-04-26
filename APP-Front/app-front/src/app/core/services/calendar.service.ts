import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: 'planting' | 'harvest' | 'irrigation' | 'fertilizing' | 'pruning' | 'treatment' | 'other';
  status: 'pending' | 'completed' | 'cancelled' | 'postponed';
  garden_id?: string;
  garden_name?: string;
  plot_id?: string;
  plot_name?: string;
  planting_id?: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

export interface TasksResponse {
  tasks: Task[];
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private readonly API_URL = environment.apiUrl;
  
  private tasksSignal = signal<Task[]>([]);
  private currentDateSignal = signal<Date>(new Date());
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly tasks = this.tasksSignal.asReadonly();
  readonly currentDate = this.currentDateSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly currentMonth = computed(() => {
    return this.currentDateSignal().getMonth();
  });

  readonly currentYear = computed(() => {
    return this.currentDateSignal().getFullYear();
  });

  readonly monthName = computed(() => {
    const date = this.currentDateSignal();
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  });

  readonly weekName = computed(() => {
    const date = this.currentDateSignal();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startDay = startOfWeek.getDate();
    const endDay = endOfWeek.getDate();
    const startMonth = startOfWeek.toLocaleDateString('es-ES', { month: 'short' });
    const endMonth = endOfWeek.toLocaleDateString('es-ES', { month: 'short' });
    
    if (startMonth === endMonth) {
      return `${startDay} - ${endDay} ${startMonth}`;
    }
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  });

  readonly currentWeekDays = computed((): CalendarDay[] => {
    const currentDate = this.currentDateSignal();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - ((currentDate.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const days: CalendarDay[] = [];
    
    const allTasks = this.tasksSignal();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dayTasks = allTasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date,
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
        isToday: date.toDateString() === today.toDateString(),
        tasks: dayTasks
      });
    }
    
    return days;
  });

  readonly calendarDays = computed((): CalendarDay[] => {
    const currentDate = this.currentDateSignal();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const offset = (firstDay.getDay() + 6) % 7;
    startDate.setDate(firstDay.getDate() - offset);

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentMonthTasks = this.tasksSignal().filter(task => {
      const taskDate = new Date(task.date);
      return taskDate.getMonth() === month && taskDate.getFullYear() === year;
    });

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayTasks = currentMonthTasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate.toDateString() === date.toDateString();
      });

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        tasks: dayTasks
      });
    }

    return days;
  });

  constructor(private http: HttpClient) {}

  loadTasksForGarden(gardenId: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http.get<TasksResponse>(`${this.API_URL}/api/gardens/${gardenId}/tasks`).pipe(
      tap(response => {
        this.tasksSignal.set(response.tasks);
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading tasks');
        return of(null);
      })
    ).subscribe();
  }

  loadTasksByDateRange(
    gardenId: string, 
    startDate: Date, 
    endDate: Date,
    filters?: { task_type?: string; status?: string; planting_id?: string; crop_id?: string }
  ): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const params: Record<string, string> = {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };

    if (filters?.['task_type']) params['task_type'] = filters['task_type'];
    if (filters?.['status']) params['status'] = filters['status'];
    if (filters?.['planting_id']) params['planting_id'] = filters['planting_id'];
    if (filters?.['crop_id']) params['crop_id'] = filters['crop_id'];

    this.http.get<any>(`${this.API_URL}/api/gardens/${gardenId}/calendar`, { params }).pipe(
      tap(response => {
        if (response.success) {
          const tasks: Task[] = [];
          const tasksByDate = response.data.tasks;
          for (const [dateStr, dayTasks] of Object.entries(tasksByDate)) {
            for (const task of dayTasks as any[]) {
              tasks.push({
                id: task.id,
                title: task.title,
                description: task.description,
                date: new Date(task.scheduled_date),
                type: task.task_type as any,
                status: task.status,
                garden_id: gardenId,
                plot_id: task.plot_id,
                planting_id: task.planting_id
              });
            }
          }
          this.tasksSignal.set(tasks);
        }
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading calendar tasks');
        return of(null);
      })
    ).subscribe();
  }

  loadAllCalendarTasks(
    startDate: Date,
    endDate: Date,
    filters?: { garden_id?: string; plot_id?: string; planting_id?: string; task_type?: string; status?: string; crop_id?: string }
  ): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const params: Record<string, string> = {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };

    if (filters?.garden_id) params['garden_id'] = filters.garden_id;
    if (filters?.plot_id) params['plot_id'] = filters.plot_id;
    if (filters?.planting_id) params['planting_id'] = filters.planting_id;
    if (filters?.task_type) params['task_type'] = filters.task_type;
    if (filters?.status) params['status'] = filters.status;
    if (filters?.crop_id) params['crop_id'] = filters.crop_id;

    this.http.get<any>(`${this.API_URL}/api/tasks/calendar`, { params }).pipe(
      tap(response => {
        if (response.success) {
          const tasks: Task[] = response.tasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            date: new Date(task.scheduled_date),
            type: task.task_type as any,
            status: task.status,
            garden_id: task.garden_id,
            garden_name: task.garden_name,
            plot_id: task.plot_id,
            plot_name: task.plot_name,
            planting_id: task.planting_id
          }));
          this.tasksSignal.set(tasks);
        }
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading calendar tasks');
        return of(null);
      })
    ).subscribe();
  }

  loadTasksForGardens(gardenIds: string[], gardenNames: Record<string, string>): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.tasksSignal.set([]);

    if (gardenIds.length === 0) {
      this.loadingSignal.set(false);
      return;
    }

    let loadedCount = 0;
    const allTasks: Task[] = [];

    for (const gardenId of gardenIds) {
      this.http.get<TasksResponse>(`${this.API_URL}/api/gardens/${gardenId}/tasks`).pipe(
        tap(response => {
          const tasksWithGardenName = response.tasks.map(task => ({
            ...task,
            garden_name: task.garden_name || gardenNames[gardenId] || 'Unknown'
          }));
          allTasks.push(...tasksWithGardenName);
          loadedCount++;
          if (loadedCount === gardenIds.length) {
            this.tasksSignal.set(allTasks);
            this.loadingSignal.set(false);
          }
        }),
        catchError((err: HttpErrorResponse) => {
          loadedCount++;
          if (loadedCount === gardenIds.length) {
            this.tasksSignal.set(allTasks);
            this.loadingSignal.set(false);
          }
          return of(null);
        })
      ).subscribe();
    }
  }

  previousMonth(): void {
    const current = this.currentDateSignal();
    this.currentDateSignal.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const current = this.currentDateSignal();
    this.currentDateSignal.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  previousWeek(): void {
    const current = this.currentDateSignal();
    this.currentDateSignal.set(new Date(current.getFullYear(), current.getMonth(), current.getDate() - 7));
  }

  nextWeek(): void {
    const current = this.currentDateSignal();
    this.currentDateSignal.set(new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7));
  }

  goToToday(): void {
    this.currentDateSignal.set(new Date());
  }

  goToDate(date: Date): void {
    this.currentDateSignal.set(date);
  }

  addTask(task: Omit<Task, 'id'>): void {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID()
    };
    this.tasksSignal.update(tasks => [...tasks, newTask]);
  }

  updateTask(id: string, updates: Partial<Omit<Task, 'id'>>): void {
    this.tasksSignal.update(tasks =>
      tasks.map(task => task.id === id ? { ...task, ...updates } : task)
    );
  }

  deleteTask(id: string): void {
    this.tasksSignal.update(tasks => tasks.filter(task => task.id !== id));
  }

  getTasksForDate(date: Date): Task[] {
    return this.tasksSignal().filter(task => {
      const taskDate = new Date(task.date);
      return taskDate.toDateString() === date.toDateString();
    });
  }

  loadSampleTasks(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'Plantación de tomates',
        description: 'Plantar tomates cherry en parcela 1',
        date: new Date(year, month, 15),
        type: 'planting',
        status: 'pending',
        garden_id: 'g1',
        garden_name: 'Huerta Principal',
        plot_id: 'p1',
        plot_name: 'Parcela 1'
      },
      {
        id: '2',
        title: 'Riego por goteo',
        description: 'Activar sistema de riego',
        date: new Date(year, month, 10),
        type: 'irrigation',
        status: 'pending',
        garden_id: 'g1',
        garden_name: 'Huerta Principal'
      },
      {
        id: '3',
        title: 'Cosecha de lechugas',
        date: new Date(year, month, 20),
        type: 'harvest',
        status: 'pending',
        garden_id: 'g1',
        garden_name: 'Huerta Principal',
        plot_id: 'p2',
        plot_name: 'Parcela 2'
      }
    ];

    this.tasksSignal.set(sampleTasks);
  }

  clearTasks(): void {
    this.tasksSignal.set([]);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  completeTask(taskId: string, completionNotes?: string): Observable<{ message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.patch<{ message: string }>(`${this.API_URL}/api/tasks/${taskId}/complete`, {
      completion_notes: completionNotes
    }).pipe(
      tap(response => {
        this.updateTask(taskId, { status: 'completed' });
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error completing task');
        return of(null);
      })
    );
  }

  postponeTask(taskId: string, reason: string, until: Date): Observable<{ message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.patch<{ message: string }>(`${this.API_URL}/api/tasks/${taskId}/postpone`, {
      reason,
      until: until.toISOString()
    }).pipe(
      tap(response => {
        this.updateTask(taskId, { status: 'postponed', date: until });
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error postponing task');
        return of(null);
      })
    );
  }

  cancelTask(taskId: string, cancellationReason: string): Observable<{ message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.patch<{ message: string }>(`${this.API_URL}/api/tasks/${taskId}/cancel`, {
      cancellation_reason: cancellationReason
    }).pipe(
      tap(response => {
        this.updateTask(taskId, { status: 'cancelled' });
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error cancelling task');
        return of(null);
      })
    );
  }
}
