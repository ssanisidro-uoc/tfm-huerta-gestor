import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';
import { TranslationService } from '../../../../core/services/i18n/translation.service';
import { PlantingService, PlantingDetail } from '../../services/planting.service';
import { PlantingAssociationsService, PlantingAssociation, AssociationObservation } from '../../services/planting-associations.service';

@Component({
  selector: 'app-planting-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
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
  harvestError = signal<string | null>(null);
  associations = signal<PlantingAssociation[]>([]);
  showAssociationObservation = false;
  observationOutcome = 'successful';
  observationRating = 5;
  observationDescription = '';
  observationError = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public plantingService: PlantingService,
    private associationsService: PlantingAssociationsService,
    private translationService: TranslationService
  ) {}

  t(key: string): string {
    return this.translationService.t(key);
  }

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
          this.loadAssociations(id);
        }
      }
    });
  }

  loadAssociations(plantingId: string): void {
    this.associationsService.getByPlanting(plantingId).subscribe({
      next: (response) => {
        if (response?.success) {
          this.associations.set(response.data.filter(a => a.is_active));
        }
      }
    });
  }

  hasActiveAssociations(): boolean {
    return this.associations().length > 0;
  }

  openAssociationObservation(): void {
    this.observationError.set(null);
    this.showAssociationObservation = true;
  }

  cancelAssociationObservation(): void {
    this.showAssociationObservation = false;
    this.observationOutcome = 'successful';
    this.observationRating = 5;
    this.observationDescription = '';
  }

  recordObservation(associationId: string): void {
    this.observationError.set(null);
    
    this.associationsService.createObservation(associationId, {
      observation_type: 'harvest_result',
      outcome: this.observationOutcome,
      effectiveness_rating: this.observationRating,
      description: this.observationDescription
    }).subscribe({
      next: (response) => {
        if (response?.success) {
          this.cancelAssociationObservation();
          alert(this.t('plantings.observationRecorded'));
        }
      },
      error: (err) => {
        this.observationError.set(err.error?.message || 'Error al registrar observación');
      }
    });
  }

  getOutcomeLabel(outcome: string): string {
    const labels: Record<string, string> = {
      'successful': 'Exitoso',
      'partial': 'Parcial',
      'failed': 'Fallido',
      'neutral': 'Neutral'
    };
    return labels[outcome] || outcome;
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
    const p = this.planting();
    if (!p) return false;
    
    const status = p.status;
    if (status !== 'growing' && status !== 'planted' && status !== 'flowering' && status !== 'fruiting') {
      return false;
    }

    const phenological = p.phenological;
    if (phenological && phenological.days_to_harvest > 0) {
      const progress = phenological.days_elapsed / phenological.days_to_harvest;
      return progress >= 0.7;
    }
    
    return true;
  }

  getHarvestMessage(): string {
    const p = this.planting();
    if (!p) return '';
    
    const phenological = p.phenological;
    if (phenological && phenological.days_to_harvest > 0) {
      const progress = (phenological.days_elapsed / phenological.days_to_harvest) * 100;
      if (progress < 70) {
        return `Aún no está listo para cosechar. Necesitas esperar al menos el 70% del ciclo (${Math.ceil(phenological.days_to_harvest * 0.7)} días). Llevas ${phenological.days_elapsed} días.`;
      }
    }
    return '';
  }

  openHarvestForm(): void {
    this.harvestError.set(null);
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

    const p = this.planting();
    const phenological = p?.phenological;
    if (phenological && phenological.days_to_harvest > 0) {
      const progress = phenological.days_elapsed / phenological.days_to_harvest;
      if (progress < 0.7) {
        this.harvestError.set(`No puedes cosechar aún. Debe pasar al menos el 70% del ciclo de crecimiento (${Math.ceil(phenological.days_to_harvest * 0.7)} días). Llevas ${phenological.days_elapsed} días.`);
        return;
      }
    }

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
          this.showHarvestForm = false;
          this.loadPlanting(id);
          
          if (this.associations().length > 0) {
            setTimeout(() => {
              if (confirm('¿Deseas registrar observaciones de las asociaciones de cultivos?')) {
                this.openAssociationObservation();
              }
            }, 500);
          }
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
