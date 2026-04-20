import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TasksService, Task, TaskStats, Plot } from '../../services/tasks.service';
import { GardenService, Garden } from '../../../gardens/services/garden.service';
import { PlotService, Plot as PlotModel } from '../../../plots/services/plot.service';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';
import { LunarBannerComponent } from '../../../../shared/components/lunar-banner/lunar-banner.component';
import { UnifiedIntelligenceService, UnifiedIntelligence } from '../../services/unified-intelligence.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, LunarBannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.scss'
})
export class TasksListComponent implements OnInit {
  tasksService = inject(TasksService);
  gardenService = inject(GardenService);
  plotService = inject(PlotService);
  unifiedIntelligenceService = inject(UnifiedIntelligenceService);
  private cdr = inject(ChangeDetectorRef);

  tasks = signal<Task[]>([]);
  stats = signal<TaskStats | null>(null);
  gardens = signal<Garden[]>([]);
  plots = signal<PlotModel[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  taskIntelligence = signal<Map<string, UnifiedIntelligence>>(new Map());

  selectedGardenId = signal<string>('');
  selectedStatus = signal<string>('');
  selectedType = signal<string>('');
  searchQuery = signal<string>('');
  sortOrder = signal<'asc' | 'desc'>('asc');

  statusOptions = [
    { value: '', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'completed', label: 'Realizadas' },
    { value: 'postponed', label: 'Aplazadas' }
  ];

  typeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'riego', label: 'Riego' },
    { value: 'fitosanitario', label: 'Fitosanitario' },
    { value: 'abonado', label: 'Abonado' },
    { value: 'cosecha', label: 'Cosecha' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      gardens: this.gardenService.getGardens(),
      stats: this.tasksService.getTaskStats(),
      tasks: this.tasksService.getAllTasks(
        1, 100,
        this.selectedGardenId() || undefined,
        this.selectedStatus() || undefined,
        this.selectedType() || undefined
      )
    }).subscribe({
      next: (results) => {
        this.loading.set(false);
        if (results.gardens) {
          this.gardens.set(results.gardens.gardens);
        }
        if (results.stats) {
          this.stats.set(results.stats.data);
        }
        if (results.tasks) {
          this.tasks.set(results.tasks.data);
          this.loadIntelligenceForTasks(results.tasks.data);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Error al cargar los datos');
        this.cdr.detectChanges();
      }
    });
  }

  loadPlotsForGarden(gardenId: string): void {
    this.plotService.getPlotsByGarden(gardenId).subscribe(response => {
      if (response) {
        this.plots.set(response.plots);
      }
    });
  }

  loadIntelligenceForTasks(tasks: Task[]): void {
    const intelligenceMap = this.taskIntelligence();
    const pendingTasks = tasks.filter(t => t.status === 'pending').slice(0, 10);
    
    for (const task of pendingTasks) {
      this.unifiedIntelligenceService.getIntelligenceForTask(task.id).subscribe(response => {
        if (response) {
          intelligenceMap.set(task.id, response);
          this.taskIntelligence.set(new Map(intelligenceMap));
          this.cdr.detectChanges();
        }
      });
    }
  }

  getIntelligenceForTask(taskId: string): UnifiedIntelligence | undefined {
    return this.taskIntelligence().get(taskId);
  }

  getIntelligenceClass(taskId: string): string {
    const intel = this.getIntelligenceForTask(taskId);
    if (!intel) return '';
    return `intelligence-${intel.priority}`;
  }

  getGardenName(gardenId: string): string {
    const garden = this.gardens().find(g => g.id === gardenId);
    return garden?.name || 'Huerto desconocido';
  }

  getPlotName(plotId: string | null): string {
    if (!plotId) return '-';
    const plot = this.plots().find(p => p.id === plotId);
    return plot?.name || 'Parcela desconocida';
  }

  getTypeLabel(type: string | null): string {
    const labels: Record<string, string> = {
      'riego': 'Riego',
      'fitosanitario': 'Fitosanitario',
      'abonado': 'Abonado',
      'cosecha': 'Cosecha'
    };
    return labels[type || ''] || type || '-';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'completed': 'Completada',
      'postponed': 'Aplazada'
    };
    return labels[status] || status;
  }

  getPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      'high': 'priority-high',
      'medium': 'priority-medium',
      'low': 'priority-low'
    };
    return classes[priority] || '';
  }

  filteredTasks(): Task[] {
    let result = this.tasks();
    const query = this.searchQuery().toLowerCase().trim();
    
    if (query) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.description?.toLowerCase().includes(query)
      );
    }

    result = [...result].sort((a, b) => {
      const dateA = new Date(a.scheduled_date).getTime();
      const dateB = new Date(b.scheduled_date).getTime();
      return this.sortOrder() === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }

  onGardenChange(): void {
    const gardenId = this.selectedGardenId();
    if (gardenId) {
      this.loadPlotsForGarden(gardenId);
    } else {
      this.plots.set([]);
    }
    this.loadData();
  }

  onStatusChange(): void {
    this.loadData();
  }

  onTypeChange(): void {
    this.loadData();
  }

  onSearchChange(): void {
    // Filtering happens in filteredTasks()
  }

  toggleSort(): void {
    this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
  }

  completeTask(taskId: string): void {
    this.tasksService.completeTask(taskId).subscribe(response => {
      if (response?.success) {
        this.loadData();
      }
    });
  }

  postponeTask(taskId: string): void {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 1);
    
    this.tasksService.postponeTask(taskId, newDate).subscribe(response => {
      if (response?.success) {
        this.loadData();
      }
    });
  }

  isUrgent(task: Task): boolean {
    if (task.status !== 'pending') return false;
    const scheduled = new Date(task.scheduled_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    scheduled.setHours(0, 0, 0, 0);
    return scheduled <= today;
  }

  isCompleted(task: Task): boolean {
    return task.status === 'completed';
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}