import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PlantingService, CreatePlantingRequest } from '../../services/planting.service';
import { GardenService, Garden } from '../../../gardens/services/garden.service';
import { PlotService, Plot } from '../../../plots/services/plot.service';
import { CropService, Crop } from '../../../crops/services/crop.service';

@Component({
  selector: 'app-planting-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  validationErrors = signal<Record<string, string>>({});

  validate(): boolean {
    const errors: Record<string, string> = {};
    
    if (!this.selectedGarden) {
      errors['garden'] = 'Selecciona una huerta';
    }
    
    if (!this.selectedPlot) {
      errors['plot'] = 'Selecciona una parcela';
    }
    
    if (!this.selectedCrop) {
      errors['crop'] = 'Selecciona un cultivo';
    }
    
    if (!this.plantedAt) {
      errors['planted_at'] = 'Selecciona una fecha de siembra';
    }
    
    if (this.quantity && this.quantity < 1) {
      errors['quantity'] = 'La cantidad debe ser mayor a 0';
    }
    
    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  constructor(
    private plantingService: PlantingService,
    private gardenService: GardenService,
    private plotService: PlotService,
    private cropService: CropService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

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
    } else {
      this.plots.set([]);
    }
  }

  isValid(): boolean {
    return !!(this.selectedGarden && this.selectedPlot && this.selectedCrop && this.plantedAt);
  }

  onSubmit(): void {
    this.error.set('');
    this.success.set('');
    this.validationErrors.set({});
    
    if (!this.validate()) {
      return;
    }
    
    this.loading.set(true);

    const data: CreatePlantingRequest = {
      garden_id: this.selectedGarden,
      plot_id: this.selectedPlot,
      crop_id: this.selectedCrop,
      planted_at: this.plantedAt,
      quantity: this.quantity
    };

    this.plantingService.createPlanting(data).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response?.success) {
          this.success.set('Cultivo registrado correctamente');
          setTimeout(() => {
            this.router.navigate(['/plantings', response.data.id]);
          }, 1500);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al registrar el cultivo');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
