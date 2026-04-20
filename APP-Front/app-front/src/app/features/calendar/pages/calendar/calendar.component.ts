import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';
import { CalendarService, Task, CalendarDay } from '../../../../core/services/calendar.service';
import { GardenService } from '../../../gardens/services/garden.service';
import { CropService, Crop } from '../../../crops/services/crop.service';

export type ViewMode = 'month' | 'week' | 'crop';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit {
  calendarService = inject(CalendarService);
  private gardenService = inject(GardenService);
  private cropService = inject(CropService);

  selectedDate = signal<Date | null>(null);
  viewMode = signal<ViewMode>('month');
  
  showCompleteModal = signal(false);
  showPostponeModal = signal(false);
  selectedTask = signal<Task | null>(null);
  completionNotes = '';
  postponeReason = '';
  postponeDate = '';

  gardens = signal<{id: string, name: string}[]>([]);
  selectedGardenId = signal<string>('');
  crops = signal<Crop[]>([]);
  selectedCropId = signal<string>('');
  taskTypes = signal<string[]>(['watering', 'weeding', 'fertilizing', 'planting', 'harvesting', 'pruning', 'spraying', 'maintenance']);
  selectedTaskType = signal<string>('');

  weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  private weekTasksCache: Task[] | null = null;

  ngOnInit(): void {
    this.loadGardens();
    this.loadCrops();
  }

  loadGardens(): void {
    this.gardenService.getGardens().subscribe((response: any) => {
      if (response && response.gardens) {
        this.gardens.set(response.gardens.map((g: any) => ({ id: g.id, name: g.name })));
        if (response.gardens.length > 0) {
          this.selectedGardenId.set(response.gardens[0].id);
          this.loadCalendarData();
        }
      }
    });
  }

  loadCrops(): void {
    this.cropService.getCrops(1, 100).subscribe((response: any) => {
      if (response && response.crops) {
        this.crops.set(response.crops);
      }
    });
  }

  loadCalendarData(): void {
    const gardenId = this.selectedGardenId();
    if (!gardenId) return;

    const currentDate = this.calendarService.currentDate();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const filters: any = {};
    if (this.selectedTaskType()) filters.task_type = this.selectedTaskType();
    if (this.selectedCropId()) filters.crop_id = this.selectedCropId();

    this.calendarService.loadTasksByDateRange(gardenId, startOfMonth, endOfMonth, filters);
  }

  onGardenChange(): void {
    this.loadCalendarData();
  }

  onCropChange(): void {
    this.loadCalendarData();
  }

  onTaskTypeChange(): void {
    this.loadCalendarData();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  selectDate(date: Date): void {
    this.selectedDate.set(date);
  }

  getTasksForDate(date: Date): Task[] {
    return this.calendarService.getTasksForDate(date);
  }

  getTodayTasks(): Task[] {
    const today = new Date();
    return this.calendarService.getTasksForDate(today);
  }

  getWeekTasks(): Task[] {
    if (this.weekTasksCache) {
      return this.weekTasksCache;
    }
    const tasks: Task[] = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      tasks.push(...this.calendarService.getTasksForDate(day));
    }
    this.weekTasksCache = tasks;
    return tasks;
  }

  getWeekPendingCount(): number {
    return this.getWeekTasks().filter(t => t.status === 'pending').length;
  }

  getWeekCompletedCount(): number {
    return this.getWeekTasks().filter(t => t.status === 'completed').length;
  }

  getMiniCalendarYear(): number {
    const days = this.calendarService.calendarDays();
    if (days.length > 15 && days[15].date) {
      return days[15].date.getFullYear();
    }
    return new Date().getFullYear();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'completed': 'Completada',
      'cancelled': 'Cancelada',
      'postponed': 'Aplazada'
    };
    return labels[status] || status;
  }

  getTaskTypeClass(type: string): string {
    const map: Record<string, string> = {
      'planting': 'type-planting',
      'watering': 'type-watering',
      'harvest': 'type-harvest',
      'harvesting': 'type-harvest',
      'fertilizing': 'type-nutrition',
      'treatment': 'type-pest',
      'pruning': 'type-maintenance',
      'weeding': 'type-maintenance',
      'spraying': 'type-pest',
      'maintenance': 'type-maintenance'
    };
    return map[type] || 'type-default';
  }

  getTaskTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'watering': 'Riego',
      'weeding': 'Desherbado',
      'fertilizing': 'Abonado',
      'planting': 'Siembra',
      'harvesting': 'Cosecha',
      'pruning': 'Poda',
      'spraying': 'Fitosanitario',
      'maintenance': 'Mantenimiento'
    };
    return labels[type] || type;
  }

  openCompleteModal(task: Task): void {
    this.selectedTask.set(task);
    this.completionNotes = '';
    this.showCompleteModal.set(true);
  }

  closeCompleteModal(): void {
    this.showCompleteModal.set(false);
    this.selectedTask.set(null);
    this.completionNotes = '';
  }

  completeTask(): void {
    const task = this.selectedTask();
    if (task) {
      this.calendarService.completeTask(task.id, this.completionNotes).subscribe(result => {
        if (result) {
          this.closeCompleteModal();
          this.weekTasksCache = null;
        }
      });
    }
  }

  openPostponeModal(task: Task): void {
    this.selectedTask.set(task);
    this.postponeReason = '';
    this.postponeDate = '';
    this.showPostponeModal.set(true);
  }

  closePostponeModal(): void {
    this.showPostponeModal.set(false);
    this.selectedTask.set(null);
    this.postponeReason = '';
    this.postponeDate = '';
  }

  postponeTask(): void {
    const task = this.selectedTask();
    if (task && this.postponeDate) {
      const until = new Date(this.postponeDate);
      this.calendarService.postponeTask(task.id, this.postponeReason, until).subscribe(result => {
        if (result) {
          this.closePostponeModal();
          this.weekTasksCache = null;
        }
      });
    }
  }

  cancelTask(task: Task): void {
    const reason = prompt('Motivo de cancelación:');
    if (reason) {
      this.calendarService.cancelTask(task.id, reason).subscribe();
    }
  }
}