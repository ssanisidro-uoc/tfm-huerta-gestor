import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { PlotService, PlotDetail } from '../../services/plot.service';
import { PlantingService, PlantingDetail } from '../../../plantings/services/planting.service';

interface PlotPlanting {
  id: string;
  crop_id: string;
  crop_name?: string;
  garden_id: string;
  plot_id: string;
  planted_at: Date;
  expected_harvest_at: Date;
  harvested_at: Date | null;
  quantity: number;
  status: string;
  days_elapsed?: number;
  days_to_harvest?: number;
}

@Component({
  selector: 'app-plot-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plot-detail.component.html',
  styleUrl: './plot-detail.component.scss'
})
export class PlotDetailComponent implements OnInit {
  plot = signal<PlotDetail | null>(null);
  plantings = signal<PlotPlanting[]>([]);
  loadingPlantings = signal(false);
  
  irrigationLabels: Record<string, string> = {
    'manual': 'Manual',
    'drip': 'Goteo',
    'sprinkler': 'Aspersión',
    'flood': 'Inundación',
    'subsurface': 'Subterráneo',
    'automatic': 'Automático',
    'rainfed': 'Secano'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public plotService: PlotService,
    private plantingService: PlantingService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPlot(id);
      this.loadPlantings(id);
    }
  }

  loadPlot(id: string): void {
    this.plotService.getPlotById(id).subscribe({
      next: (plot) => {
        if (plot) {
          this.plot.set(plot);
        }
      }
    });
  }

  loadPlantings(plotId: string): void {
    this.loadingPlantings.set(true);
    this.plantingService.getPlantingsByPlot(plotId).subscribe({
      next: (response) => {
        this.loadingPlantings.set(false);
        if (response?.success && response.data) {
          this.plantings.set(response.data);
        }
      },
      error: () => {
        this.loadingPlantings.set(false);
      }
    });
  }

  getIrrigationLabel(type: string): string {
    return this.irrigationLabels[type] || type;
  }

  addPlanting(): void {
    const plot = this.plot();
    if (plot) {
      this.router.navigate(['/plantings/create', plot.garden_id], { 
        queryParams: { plotId: plot.id } 
      });
    }
  }

  viewPlanting(plantingId: string): void {
    this.router.navigate(['/plantings', plantingId]);
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  getProgressPercent(planting: PlotPlanting): number {
    if (!planting.days_elapsed || !planting.days_to_harvest) return 0;
    const total = planting.days_elapsed + planting.days_to_harvest;
    return total > 0 ? Math.round((planting.days_elapsed / total) * 100) : 0;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'growing': 'En crecimiento',
      'planted': 'Activo',
      'harvested': 'Cosechado',
      'archived': 'Archivado'
    };
    return labels[status] || status;
  }
}
