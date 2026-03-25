import { Injectable, signal, computed } from '@angular/core';

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

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private tasksSignal = signal<Task[]>([]);
  private currentDateSignal = signal<Date>(new Date());

  readonly tasks = this.tasksSignal.asReadonly();
  readonly currentDate = this.currentDateSignal.asReadonly();

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
      },
      {
        id: '4',
        title: 'Fertilización',
        date: new Date(year, month, 25),
        type: 'fertilizing',
        status: 'pending',
        garden_id: 'g1',
        garden_name: 'Huerta Principal'
      },
      {
        id: '5',
        title: 'Poda de árboles',
        date: new Date(year, month, 28),
        type: 'pruning',
        status: 'pending',
        garden_id: 'g1',
        garden_name: 'Huerta Principal'
      }
    ];

    this.tasksSignal.set(sampleTasks);
  }

  clearTasks(): void {
    this.tasksSignal.set([]);
  }
}
