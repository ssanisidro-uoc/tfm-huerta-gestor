import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TasksService } from '../../services/tasks.service';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';

interface TaskHistoryItem {
  task_id: string;
  title: string;
  task_type: string;
  task_category: string | null;
  status: string;
  priority: string;
  scheduled_date: string;
  due_date: string | null;
  completed_at: string | null;
  completed_by: string | null;
  postponed_at: string | null;
  postponed_until: string | null;
  postponed_reason: string | null;
  cancellation_reason: string | null;
  created_at: string;
}

interface CropHistoryResponse {
  planting_id: string;
  crop_name: string;
  plot_name: string;
  garden_name: string;
  tasks: TaskHistoryItem[];
}

@Component({
  selector: 'app-task-history',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-history.component.html',
  styleUrl: './task-history.component.scss'
})
export class TaskHistoryComponent implements OnInit {
  private tasksService = inject(TasksService);
  private route = inject(ActivatedRoute);

  plantingId = '';
  loading = signal(false);
  error = signal<string | null>(null);
  history = signal<CropHistoryResponse | null>(null);

  ngOnInit(): void {
    this.plantingId = this.route.snapshot.paramMap.get('id') || '';
    if (this.plantingId) {
      this.loadHistory();
    }
  }

  loadHistory(): void {
    this.loading.set(true);
    this.error.set(null);

    this.tasksService.getTasksByPlanting(this.plantingId).subscribe((response: any) => {
      this.loading.set(false);
      if (response && response.success) {
        this.history.set(response.data);
      } else {
        this.error.set('Error al cargar el historial');
      }
    });
  }

  getCompletedCount(): number {
    return this.history()?.tasks.filter(t => t.status === 'completed').length || 0;
  }

  getPendingCount(): number {
    return this.history()?.tasks.filter(t => t.status === 'pending').length || 0;
  }

  getPostponedCount(): number {
    return this.history()?.tasks.filter(t => t.status === 'postponed').length || 0;
  }

  getCancelledCount(): number {
    return this.history()?.tasks.filter(t => t.status === 'cancelled').length || 0;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  getTaskTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      watering: 'Riego',
      weeding: 'Desherbado',
      fertilizing: 'Abonado',
      planting: 'Siembra',
      harvesting: 'Cosecha',
      pruning: 'Poda',
      spraying: 'Fitosanitario',
      maintenance: 'Mantenimiento'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      completed: 'Completada',
      postponed: 'Pospuesta',
      cancelled: 'Cancelada',
      in_progress: 'En progreso'
    };
    return labels[status] || status;
  }
}