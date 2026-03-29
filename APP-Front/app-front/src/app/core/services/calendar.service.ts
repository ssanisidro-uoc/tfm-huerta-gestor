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
  status: 'pending' | 'completed' | 'cancelled';
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

  readonly calendarDays = computed((): CalendarDay[] => {
    const currentDate = this.currentDateSignal();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

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

  goToToday(): void {
    this.currentDateSignal.set(new Date());
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
}
