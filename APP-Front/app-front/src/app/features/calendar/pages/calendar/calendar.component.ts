import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';
import { CalendarService, Task, CalendarDay } from '../../../../core/services/calendar.service';
import { GardenService } from '../../../gardens/services/garden.service';
import { PlotService } from '../../../plots/services/plot.service';
import { PlantingService } from '../../../plantings/services/planting.service';

export type ViewMode = 'month' | 'week' | 'crop';

interface SimpleCrop {
  id: string;
  name: string;
}

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
  private plotService = inject(PlotService);
  private plantingService = inject(PlantingService);

  selectedDate = signal<Date | null>(null);
  viewMode = signal<ViewMode>('month');
  
  showCompleteModal = signal(false);
  showPostponeModal = signal(false);
  selectedTask = signal<Task | null>(null);
  completionNotes = '';
  postponeReason = '';
  postponeDate = '';

  gardens = signal<{id: string, name: string}[]>([]);
  plots = signal<{id: string, name: string}[]>([]);
  crops = signal<SimpleCrop[]>([]);
  
  selectedGardenId = signal<string>('');
  selectedPlotId = signal<string>('');
  selectedCropId = signal<string>('');
  selectedTaskType = signal<string>('');

  taskTypes = [
    { value: '', label: 'Todos' },
    { value: 'watering', label: 'Riego' },
    { value: 'weeding', label: 'Desherbado' },
    { value: 'fertilizing', label: 'Abonado' },
    { value: 'planting', label: 'Siembra' },
    { value: 'harvesting', label: 'Cosecha' },
    { value: 'pruning', label: 'Poda' },
    { value: 'treatment', label: 'Fitosanitario' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'other', label: 'Otro' }
  ];

  weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  weekDaysFull = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  ngOnInit(): void {
    this.loadGardens();
    this.loadCalendarData();
  }

  loadGardens(): void {
    this.gardenService.getGardens().subscribe((response: any) => {
      if (response && response.gardens) {
        this.gardens.set(response.gardens.map((g: any) => ({ id: g.id, name: g.name })));
      }
    });
  }

  onGardenChange(): void {
    this.selectedPlotId.set('');
    if (this.selectedGardenId()) {
      this.plotService.getPlotsByGarden(this.selectedGardenId()).subscribe((response: any) => {
        if (response && response.plots) {
          this.plots.set(response.plots.map((p: any) => ({ id: p.id, name: p.name })));
          this.loadCropsFromPlots(response.plots.map((p: any) => p.id));
        }
      });
    } else {
      this.plots.set([]);
      this.crops.set([]);
    }
    this.loadCalendarData();
  }

  loadCropsFromPlots(plotIds: string[]): void {
    if (plotIds.length === 0) {
      this.crops.set([]);
      return;
    }
    
    const cropsMap = new Map<string, SimpleCrop>();
    let completed = 0;
    
    plotIds.forEach(plotId => {
      this.plantingService.getPlantingsByPlot(plotId).subscribe({
        next: (response) => {
          if (response?.data) {
            response.data.forEach((planting: any) => {
              if (!cropsMap.has(planting.crop_id)) {
                cropsMap.set(planting.crop_id, {
                  id: planting.crop_id,
                  name: planting.crop_name || 'Cultivo sin nombre'
                });
              }
            });
          }
          completed++;
          if (completed === plotIds.length) {
            this.crops.set(Array.from(cropsMap.values()));
          }
        },
        error: () => {
          completed++;
          if (completed === plotIds.length) {
            this.crops.set(Array.from(cropsMap.values()));
          }
        }
      });
    });
  }

  loadCalendarData(): void {
    const currentDate = this.calendarService.currentDate();
    const filters: any = {};
    
    if (this.viewMode() === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - ((currentDate.getDay() + 6) % 7));
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      if (this.selectedGardenId()) filters.garden_id = this.selectedGardenId();
      if (this.selectedPlotId()) filters.plot_id = this.selectedPlotId();
      if (this.selectedCropId()) filters.crop_id = this.selectedCropId();
      if (this.selectedTaskType()) filters.task_type = this.selectedTaskType();
      
      this.calendarService.loadAllCalendarTasks(startOfWeek, endOfWeek, filters);
    } else {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      if (this.selectedGardenId()) filters.garden_id = this.selectedGardenId();
      if (this.selectedPlotId()) filters.plot_id = this.selectedPlotId();
      if (this.selectedCropId()) filters.crop_id = this.selectedCropId();
      if (this.selectedTaskType()) filters.task_type = this.selectedTaskType();
      
      this.calendarService.loadAllCalendarTasks(startOfMonth, endOfMonth, filters);
    }
  }

  onPlotChange(): void {
    if (this.selectedPlotId()) {
      this.loadCropsFromPlots([this.selectedPlotId()]);
    } else if (this.selectedGardenId()) {
      this.plotService.getPlotsByGarden(this.selectedGardenId()).subscribe((response: any) => {
        if (response && response.plots) {
          this.loadCropsFromPlots(response.plots.map((p: any) => p.id));
        }
      });
    }
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
    this.loadCalendarData();
  }

  clearFilters(): void {
    this.selectedGardenId.set('');
    this.selectedPlotId.set('');
    this.selectedCropId.set('');
    this.selectedTaskType.set('');
    this.plots.set([]);
    this.crops.set([]);
    this.loadCalendarData();
  }

  goToToday(): void {
    this.calendarService.goToDate(new Date());
    this.loadCalendarData();
  }

  previousMonth(): void {
    this.calendarService.previousMonth();
    this.loadCalendarData();
  }

  nextMonth(): void {
    this.calendarService.nextMonth();
    this.loadCalendarData();
  }

  previousWeek(): void {
    this.calendarService.previousWeek();
    this.loadCalendarData();
  }

  nextWeek(): void {
    this.calendarService.nextWeek();
    this.loadCalendarData();
  }

  selectDate(date: Date | null): void {
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
    const tasks: Task[] = [];
    const currentDate = this.calendarService.currentDate();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - ((currentDate.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      tasks.push(...this.calendarService.getTasksForDate(day));
    }
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
          this.loadCalendarData();
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
          this.loadCalendarData();
        }
      });
    }
  }

  cancelTask(task: Task): void {
    const reason = prompt('Motivo de cancelación:');
    if (reason) {
      this.calendarService.cancelTask(task.id, reason).subscribe(result => {
        if (result) {
          this.loadCalendarData();
        }
      });
    }
  }
}