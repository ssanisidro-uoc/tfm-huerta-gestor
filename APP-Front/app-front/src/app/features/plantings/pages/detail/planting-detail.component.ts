import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlantingService, PlantingDetail } from '../../services/planting.service';

@Component({
  selector: 'app-planting-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './planting-detail.component.html',
  styleUrl: './planting-detail.component.scss'
})
export class PlantingDetailComponent implements OnInit {
  planting = signal<PlantingDetail | null>(null);
  harvestDate = new Date().toISOString().split('T')[0];
  showHarvestForm = false;
  harvestKg = '';
  harvestQuality = 'good';
  harvestNotes = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public plantingService: PlantingService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPlanting(id);
    }
  }

  loadPlanting(id: string): void {
    this.plantingService.getPlantingStatus(id).subscribe({
      next: (response) => {
        if (response?.success) {
          this.planting.set(response.data);
        }
      }
    });
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES');
  }

  getPhaseClass(phase: string): string {
    const phaseMap: Record<string, string> = {
      'Germinación': 'germinacion',
      'Crecimiento': 'crecimiento',
      'Desarrollo': 'desarrollo',
      'Floración': 'floracion',
      'Fructificación': 'fructificacion',
      'Maduración': 'maduracion'
    };
    return phaseMap[phase] || '';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'planted': 'Sembrado',
      'growing': 'En crecimiento',
      'harvested': 'Cosechado',
      'archived': 'Archivado',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }

  canHarvest(): boolean {
    const status = this.planting()?.status;
    return status === 'growing' || status === 'planted' || status === 'flowering' || status === 'fruiting';
  }

  openHarvestForm(): void {
    this.showHarvestForm = true;
  }

  cancelHarvest(): void {
    this.showHarvestForm = false;
    this.harvestKg = '';
    this.harvestQuality = 'buena';
    this.harvestNotes = '';
  }

  onHarvest(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const kg = this.harvestKg ? parseFloat(this.harvestKg) : undefined;
    
    this.plantingService.harvestPlanting(
      id,
      this.harvestDate,
      kg,
      this.harvestQuality,
      this.harvestNotes || undefined
    ).subscribe({
      next: (response) => {
        if (response?.success) {
          alert('Cosecha registrada correctamente');
          this.showHarvestForm = false;
          this.loadPlanting(id);
        }
      }
    });
  }

  getQualityLabel(quality: string): string {
    const labels: Record<string, string> = {
      'excellent': 'Excelente',
      'good': 'Buena',
      'acceptable': 'Regular',
      'poor': 'Baja'
    };
    return labels[quality] || quality;
  }
}
