import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { PlotService } from '../../../plots/services/plot.service';
import { TasksService } from '../../../tasks/services/tasks.service';
import { PlantingService } from '../../../plantings/services/planting.service';
import {
  CreateGardenRequest,
  GardenDetail,
  GardenService,
} from '../../services/garden.service';

interface PlotWithCrops {
  id: string;
  name: string;
  surface_m2: number;
  soil_type: string;
  crops: {
    id: string;
    name: string;
    growth_percentage: number;
  }[];
  next_task?: {
    type: string;
    date: Date;
  };
}

interface GardenTask {
  id: string;
  crop_name: string;
  plot_name: string;
  type: string;
  scheduled_date: Date;
  status: 'Pendiente' | 'Urgente' | 'Lista' | 'Programada';
  completed: boolean;
}

interface HarvestHistoryItem {
  id: string;
  crop_name: string;
  planted_at: Date;
  harvested_at: Date | null;
  quantity: number;
  unit: string;
}

@Component({
  selector: 'app-garden-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BreadcrumbComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './garden-detail.component.html',
  styleUrl: './garden-detail.component.scss'
})
export class GardenDetailComponent implements OnInit {
  garden = signal<GardenDetail | null>(null);
  plots = signal<PlotWithCrops[]>([]);
  tasks = signal<GardenTask[]>([]);
  harvestHistory = signal<HarvestHistoryItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  isEditing = signal(false);
  isInviting = signal(false);
  editForm: Partial<CreateGardenRequest> = {};
  inviteEmail = '';
  inviteRole = 'collaborator';
  inviteMessage = signal('');
  editMessage = signal('');

  breadcrumbs = signal<BreadcrumbItem[]>([]);

  climateLabels: Record<string, string> = {
    mediterranean_coast: 'Costa Mediterránea',
    mediterranean_interior: 'Interior Mediterráneo',
    atlantic: 'Atlántico',
    continental: 'Continental',
    mountain: 'Montaña',
    subtropical: 'Subtropical',
    semiarid: 'Semiárido',
    canary_islands: 'Islas Canarias',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public gardenService: GardenService,
    public plotService: PlotService,
    private tasksService: TasksService,
    private plantingService: PlantingService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGarden(id);
      this.loadPlots(id);
      this.loadTasks(id);
      this.loadHarvestHistory(id);
    }
  }

  loadGarden(id: string): void {
    this.gardenService.getGardenById(id).subscribe({
      next: (garden) => {
        if (garden) {
          this.garden.set(garden);
          this.breadcrumbs.set([
            { label: 'Huertas', routerLink: '/gardens' },
            { label: garden.name },
          ]);
        }
      },
    });
  }

  loadPlots(gardenId: string): void {
    this.plotService.getPlotsByGarden(gardenId).subscribe({
      next: (response: any) => {
        // Usamos 'any' temporalmente para evitar errores, pero luego lo tiparemos mejor
        if (!response) {
          this.plots.set([]);
          return;
        }

        // Extraemos el array de parcelas según la estructura real
        let plotsArray: any[] = [];
        if (Array.isArray(response)) {
          plotsArray = response;
        } else if (response.plots && Array.isArray(response.plots)) {
          plotsArray = response.plots;
        } else {
          // Si no encontramos un array, asignamos vacío
          console.warn(
            'Formato de respuesta de parcelas no reconocido',
            response,
          );
          this.plots.set([]);
          return;
        }

        // Transformamos cada parcela al formato que espera el template
        const adaptedPlots: PlotWithCrops[] = plotsArray.map((plot) => ({
          id: plot.id,
          name: plot.name,
          surface_m2: plot.surface_m2,
          soil_type: plot.soil_type || 'Suelo', // valor por defecto si no viene
          crops: (plot.crops || []).map((crop: any) => ({
            id: crop.id,
            name: crop.name,
            growth_percentage: crop.growth_percentage ?? 0,
          })),
          next_task: plot.next_task
            ? {
                type: plot.next_task.type,
                date: new Date(plot.next_task.date),
              }
            : undefined,
        }));

        this.plots.set(adaptedPlots);
      },
      error: (err) => {
        console.error('Error cargando parcelas', err);
        this.error.set('Error al cargar las parcelas');
      },
    });
  }

  loadTasks(gardenId: string) {
    this.tasksService.getTasksByGarden(gardenId).subscribe({
      next: (response: any) => {
        if (!response) {
          this.tasks.set([]);
          return;
        }

        let tasksArray: any[] = [];
        if (Array.isArray(response)) {
          tasksArray = response;
        } else if (response.tasks && Array.isArray(response.tasks)) {
          tasksArray = response.tasks;
        } else {
          console.warn(
            'Formato de respuesta de tareas no reconocido',
            response,
          );
          this.tasks.set([]);
          return;
        }

        const adaptedTasks: GardenTask[] = tasksArray.map((task) => ({
          id: task.id,
          crop_name: task.crop_name,
          plot_name: task.plot_name,
          type: task.type,
          scheduled_date: new Date(task.scheduled_date),
          status: task.status || 'Pendiente',
          completed: task.completed ?? false,
        }));

        this.tasks.set(adaptedTasks);
      },
      error: (err) => {
        console.error('Error cargando tareas', err);
        this.error.set('Error al cargar las tareas');
      },
    });
  }

  loadHarvestHistory(gardenId: string) {
    this.plantingService.getArchivedPlantings(gardenId).subscribe({
      next: (response) => {
        if (!response) {
          this.harvestHistory.set([]);
          return;
        }

        const adapted: HarvestHistoryItem[] = response.plantings.map((item) => ({
          id: item.id,
          crop_name: item.crop_name,
          planted_at: new Date(item.planted_at),
          harvested_at: item.harvested_at ? new Date(item.harvested_at) : null,
          quantity: item.quantity,
          unit: item.unit,
        }));

        this.harvestHistory.set(adapted);
      },
      error: (err) => {
        console.error('Error cargando historial de cosechas', err);
      },
    });
  }

  getClimateLabel(zone: string): string {
    return this.climateLabels[zone] || zone;
  }

  startEdit(): void {
    const g = this.garden();
    if (g) {
      this.editForm = {
        name: g.name,
        description: g.description || undefined,
        climate_zone: g.climate_zone,
        surface_m2: g.surface_m2 || undefined,
        hardiness_zone: g.hardiness_zone || undefined,
      };
      this.isEditing.set(true);
      this.editMessage.set('');
    }
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.editMessage.set('');
  }

  saveEdit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.gardenService.updateGarden(id, this.editForm).subscribe({
        next: (response) => {
          if (response) {
            this.editMessage.set('Huerta actualizada correctamente');
            this.loadGarden(id);
            setTimeout(() => this.isEditing.set(false), 1500);
          }
        },
      });
    }
  }

  startInvite(): void {
    this.isInviting.set(true);
    this.inviteMessage.set('');
  }

  cancelInvite(): void {
    this.isInviting.set(false);
    this.inviteMessage.set('');
  }

  sendInvite(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.inviteEmail) {
      this.gardenService.inviteCollaborator(id, this.inviteEmail, this.inviteRole).subscribe({
        next: (response) => {
          if (response) {
            this.inviteMessage.set('Invitación enviada correctamente');
            this.inviteEmail = '';
            setTimeout(() => this.isInviting.set(false), 2000);
          }
        },
      });
    }
  }

  onDelete(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && confirm('¿Estás seguro de que quieres eliminar esta huerta?')) {
      this.gardenService.deleteGarden(id).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['/gardens']);
          }
        },
      });
    }
  }
}
