import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TasksService, CreateTaskRequest } from '../../services/tasks.service';
import { GardenService, Garden } from '../../../gardens/services/garden.service';
import { PlotService, Plot as PlotModel } from '../../../plots/services/plot.service';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';
import { LunarDateSuggestionsComponent } from '../../../../shared/components/lunar-date-suggestions/lunar-date-suggestions.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

const TASK_TYPES = [
  { value: 'watering', label: 'Riego' },
  { value: 'treatment', label: 'Fitosanitario' },
  { value: 'fertilizing', label: 'Abonado' },
  { value: 'harvesting', label: 'Cosecha' },
  { value: 'sowing', label: 'Siembra' },
  { value: 'transplanting', label: 'Trasplante' },
  { value: 'weeding', label: 'Escarda' },
  { value: 'other', label: 'Otro' }
];

const PRIORITIES = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' }
];

interface Planting {
  id: string;
  crop_name: string;
  plot_name: string;
  status: string;
}

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, LunarDateSuggestionsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-create.component.html',
  styleUrl: './task-create.component.scss'
})
export class TaskCreateComponent implements OnInit {
  tasksService = inject(TasksService);
  gardenService = inject(GardenService);
  plotService = inject(PlotService);
  private http = inject(HttpClient);
  private router = inject(Router);

  gardens = signal<Garden[]>([]);
  plots = signal<PlotModel[]>([]);
  plantings = signal<Planting[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  title = '';
  description = '';
  garden_id = '';
  plot_id = '';
  planting_id = '';
  task_type = '';
  priority = 'medium';
  scheduled_date = '';
  due_date = '';

  taskTypes = TASK_TYPES;
  priorities = PRIORITIES;

  ngOnInit(): void {
    this.loadGardens();
  }

  loadGardens(): void {
    this.gardenService.getGardens().subscribe(response => {
      if (response) {
        this.gardens.set(response.gardens);
      }
    });
  }

  onGardenChange(): void {
    this.plot_id = '';
    this.planting_id = '';
    this.plantings.set([]);
    if (this.garden_id) {
      this.plotService.getPlotsByGarden(this.garden_id).subscribe(response => {
        if (response) {
          this.plots.set(response.plots);
        }
      });
    } else {
      this.plots.set([]);
    }
  }

  onPlotChange(): void {
    this.planting_id = '';
    this.plantings.set([]);
    if (this.plot_id) {
      this.loadPlantings();
    }
  }

  loadPlantings(): void {
    const url = `${environment.apiUrl}/api/plots/${this.plot_id}/plantings`;
    this.http.get<{ success: boolean; data: Planting[] }>(url).subscribe({
      next: (response) => {
        if (response?.data) {
          this.plantings.set(response.data.filter((p: Planting) => 
            p.status === 'active' || p.status === 'growing'
          ));
        }
      },
      error: () => {
        this.plantings.set([]);
      }
    });
  }

  onSubmit(): void {
    if (!this.title.trim()) {
      this.error.set('El título es obligatorio');
      return;
    }

    if (!this.garden_id) {
      this.error.set('Debes seleccionar una huerta');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const request: CreateTaskRequest = {
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      garden_id: this.garden_id,
      plot_id: this.plot_id || undefined,
      planting_id: this.planting_id || undefined,
      task_type: this.task_type || undefined,
      priority: this.priority || undefined,
      scheduled_date: this.scheduled_date ? new Date(this.scheduled_date) : undefined,
      due_date: this.due_date ? new Date(this.due_date) : undefined
    };

    this.tasksService.createTask(request).subscribe(response => {
      this.loading.set(false);
      if (response?.success) {
        this.success.set(true);
        setTimeout(() => {
          this.router.navigate(['/tareas']);
        }, 1500);
      } else {
        this.error.set(response?.message || 'Error al crear la tarea');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/tareas']);
  }
}