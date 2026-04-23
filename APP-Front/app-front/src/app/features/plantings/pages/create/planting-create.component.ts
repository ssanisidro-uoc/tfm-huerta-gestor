import { Component, OnInit, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';
import { TranslationService } from '../../../../core/services/i18n/translation.service';
import { PlantingService, CreatePlantingRequest } from '../../services/planting.service';
import { PlantingAssociationsService, CompanionSuggestion, ActivePlanting } from '../../services/planting-associations.service';
import { GardenService, Garden } from '../../../gardens/services/garden.service';
import { PlotService, Plot } from '../../../plots/services/plot.service';
import { CropService, Crop } from '../../../crops/services/crop.service';

@Component({
  selector: 'app-planting-create',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './planting-create.component.html',
  styleUrl: './planting-create.component.scss'
})
export class PlantingCreateComponent implements OnInit {
  gardens = signal<Garden[]>([]);
  plots = signal<Plot[]>([]);
  crops = signal<Crop[]>([]);
  
  selectedGarden = '';
  selectedPlot = '';
  selectedCrop = '';
  plantedAt = new Date().toISOString().split('T')[0];
  quantity = 1;
  
  loading = signal(false);
  error = signal('');
  success = signal('');
  warnings = signal<any[]>([]);
  validationErrors = signal<Record<string, string>>({});
  rotationCheck = signal<{
    isSafe: boolean;
    severity: 'error' | 'warning' | 'info';
    message: string;
    alternatives?: Array<{ cropId: string; cropName: string; rotationType: string }>;
  } | null>(null);
  rotationRecommendations = signal<any>(null);

  companionPlantings = signal<ActivePlanting[]>([]);
  selectedCompanions = signal<string[]>([]);
  companionSuggestions = signal<CompanionSuggestion[]>([]);

  validate(): boolean {
    const errors: Record<string, string> = {};
    
    if (!this.selectedGarden) {
      errors['garden'] = this.t('plantings.selectGarden');
    }
    
    if (!this.selectedPlot) {
      errors['plot'] = this.t('plantings.selectPlot');
    }
    
    if (!this.selectedCrop) {
      errors['crop'] = this.t('plantings.selectCrop');
    }
    
    if (!this.plantedAt) {
      errors['planted_at'] = this.t('plantings.selectPlantingDate');
    }
    
    if (this.quantity && this.quantity < 1) {
      errors['quantity'] = this.t('plantings.quantityError');
    }

    const rotation = this.rotationCheck();
    if (rotation && rotation.severity === 'error') {
      errors['rotation'] = rotation.message;
    }

    const incompatibleWarnings = this.warnings().filter(w => 
      w.compatibility_type === 'incompatible' || w.compatibility_type === 'highly_incompatible'
    );
    if (incompatibleWarnings.length > 0) {
      errors['incompatible'] = this.t('plantings.incompatibleWarning');
    }
    
    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  constructor(
    private plantingService: PlantingService,
    private plantingAssociationsService: PlantingAssociationsService,
    private gardenService: GardenService,
    private plotService: PlotService,
    private cropService: CropService,
    private router: Router,
    private route: ActivatedRoute,
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  t(key: string): string {
    return this.translationService.t(key);
  }

  ngOnInit(): void {
    this.loadGardens();
    this.loadCrops();
    
    const gardenId = this.route.snapshot.paramMap.get('gardenId');
    if (gardenId) {
      this.selectedGarden = gardenId;
      this.onGardenChange();
    }

    const plotId = this.route.snapshot.queryParamMap.get('plotId');
    if (plotId) {
      this.loadPlotAndSet(plotId);
    }
  }

  loadPlotAndSet(plotId: string): void {
    this.plotService.getPlotById(plotId).subscribe({
      next: (plot) => {
        if (plot) {
          this.selectedGarden = plot.garden_id;
          this.selectedPlot = plot.id;
          this.onGardenChange();
        }
      }
    });
  }

  loadGardens(): void {
    this.gardenService.getGardens().subscribe({
      next: (response) => {
        if (response) {
          this.gardens.set(response.gardens);
        }
      }
    });
  }

  loadCrops(): void {
    this.cropService.getCrops().subscribe({
      next: (response) => {
        if (response) {
          this.crops.set(response.crops);
        }
      }
    });
  }

  onGardenChange(): void {
    if (this.selectedGarden) {
      this.plotService.getPlotsByGarden(this.selectedGarden);
      this.plots.set(this.plotService.plots());
      this.rotationCheck.set(null);
    } else {
      this.plots.set([]);
    }
  }

  onPlotChange(): void {
    this.rotationCheck.set(null);
    this.rotationRecommendations.set(null);
    this.companionPlantings.set([]);
    this.selectedCompanions.set([]);
    this.companionSuggestions.set([]);
    if (this.selectedPlot && this.selectedCrop) {
      this.checkRotation();
      this.loadCompanionSuggestions();
    }
    if (this.selectedPlot && !this.selectedCrop) {
      this.loadRotationRecommendations();
    }
    if (this.selectedPlot) {
      this.loadActivePlantings();
    }
  }

  onCropChange(): void {
    this.rotationCheck.set(null);
    if (this.selectedPlot && this.selectedCrop) {
      this.checkRotation();
      this.loadCompanionSuggestions();
    }
  }

  loadCompanionSuggestions(): void {
    if (!this.selectedPlot || !this.selectedCrop) return;

    const selectedCropData = this.crops().find(c => c.id === this.selectedCrop);
    if (!selectedCropData) return;

    this.plantingAssociationsService.getCompanionSuggestions(this.selectedPlot, this.selectedCrop).subscribe({
      next: (response) => {
        if (response?.success) {
          this.companionSuggestions.set(response.data);
          this.cdr.markForCheck();
        }
      }
    });
  }

  loadActivePlantings(): void {
    if (!this.selectedPlot) return;

    this.plantingAssociationsService.getActivePlantings(this.selectedPlot).subscribe({
      next: (response) => {
        if (response?.success) {
          this.companionPlantings.set(response.data);
          this.cdr.markForCheck();
        }
      }
    });
  }

  toggleCompanion(plantingId: string): void {
    const current = this.selectedCompanions();
    if (current.includes(plantingId)) {
      this.selectedCompanions.set(current.filter(id => id !== plantingId));
    } else {
      this.selectedCompanions.set([...current, plantingId]);
    }
  }

  isCompanionSelected(plantingId: string): boolean {
    return this.selectedCompanions().includes(plantingId);
  }

  getFilteredCompanions(): ActivePlanting[] {
    return this.companionPlantings();
  }

  checkRotation(): void {
    if (!this.selectedPlot || !this.selectedCrop) return;

    this.plantingService.checkRotation(this.selectedPlot, this.selectedCrop).subscribe({
      next: (response) => {
        if (response?.success) {
          this.rotationCheck.set(response.data);
          this.cdr.markForCheck();
        }
      }
    });
  }

  loadRotationRecommendations(): void {
    if (!this.selectedPlot) return;

    this.plantingService.getRotationRecommendations(this.selectedPlot).subscribe({
      next: (response) => {
        if (response?.success) {
          this.rotationRecommendations.set(response.data);
          this.cdr.markForCheck();
        }
      }
    });
  }

  selectAlternativeCrop(cropId: string, cropName: string): void {
    this.selectedCrop = cropId;
    this.rotationCheck.set(null);
    this.checkRotation();
  }

  canSubmit(): boolean {
    const rotation = this.rotationCheck();
    if (rotation && rotation.severity === 'error') {
      return false;
    }
    return this.isValid();
  }

  getRotationClass(): string {
    const rotation = this.rotationCheck();
    if (!rotation) return '';
    if (rotation.severity === 'error') return 'rotation-error';
    if (rotation.severity === 'warning') return 'rotation-warning';
    return 'rotation-info';
  }

  isValid(): boolean {
    return !!(this.selectedGarden && this.selectedPlot && this.selectedCrop && this.plantedAt);
  }

  onSubmit(): void {
    this.error.set('');
    this.success.set('');
    this.warnings.set([]);
    this.validationErrors.set({});
    
    if (!this.validate()) {
      return;
    }
    
    this.loading.set(true);

    const selectedCropData = this.crops().find(c => c.id === this.selectedCrop);
    const daysToMaturity = selectedCropData 
      ? Math.max(selectedCropData.days_to_harvest_min, selectedCropData.days_to_harvest_max)
      : 90;

    const data: CreatePlantingRequest = {
      garden_id: this.selectedGarden,
      plot_id: this.selectedPlot,
      crop_id: this.selectedCrop,
      planted_at: this.plantedAt,
      quantity: this.quantity,
      crop_name: selectedCropData?.name || 'Unknown',
      days_to_maturity: daysToMaturity
    };

    this.plantingService.createPlanting(data).subscribe({
      next: (response) => {
        if (response?.success) {
          const newPlantingId = response.data.id;
          
          if (response.warnings && response.warnings.length > 0) {
            this.warnings.set(response.warnings);
          }
          
          if (this.selectedCompanions().length > 0) {
            this.createCompanionAssociations(newPlantingId);
          } else {
            this.success.set(this.t('plantings.registerSuccess'));
            setTimeout(() => {
              this.router.navigate(['/plantings', newPlantingId]);
            }, 1500);
          }
          
          this.loading.set(false);
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || this.t('plantings.registerError'));
      }
    });
  }

  private createCompanionAssociations(plantingId: string): void {
    const companions = this.selectedCompanions();
    let created = 0;
    let errors = 0;

    companions.forEach((companionId) => {
      this.plantingAssociationsService.create(plantingId, {
        companion_planting_id: companionId
      }).subscribe({
        next: () => {
          created++;
          if (created + errors === companions.length) {
            this.finishSubmission(plantingId, created, errors);
          }
        },
        error: () => {
          errors++;
          if (created + errors === companions.length) {
            this.finishSubmission(plantingId, created, errors);
          }
        }
      });
    });
  }

  private finishSubmission(plantingId: string, created: number, errors: number): void {
    if (errors > 0) {
      this.warnings.set([...this.warnings(), { 
        message: `Se crearon ${created} asociaciones, pero ${errors} fallaron` 
      }]);
    }
    this.success.set(this.t('plantings.registerSuccess'));
    setTimeout(() => {
      this.router.navigate(['/plantings', plantingId]);
    }, 1500);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
