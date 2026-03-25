import { Component, OnInit, signal } from '@angular/core';
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
  template: `
    <div class="create-planting">
      <h2>Registrar Cultivo</h2>
      
      @if (loading()) {
        <div class="loading">Guardando...</div>
      }
      
      @if (error()) {
        <div class="error-message">{{ error() }}</div>
      }
      
      @if (success()) {
        <div class="success-message">{{ success() }}</div>
      }
      
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="garden">Huerta *</label>
          <select id="garden" [(ngModel)]="selectedGarden" name="garden" (change)="onGardenChange()" required>
            <option value="">Selecciona una huerta</option>
            @for (garden of gardens(); track garden.id) {
              <option [value]="garden.id">{{ garden.name }}</option>
            }
          </select>
        </div>
        
        <div class="form-group">
          <label for="plot">Parcela *</label>
          <select id="plot" [(ngModel)]="selectedPlot" name="plot" required [disabled]="!selectedGarden">
            <option value="">Selecciona una parcela</option>
            @for (plot of plots(); track plot.id) {
              <option [value]="plot.id">{{ plot.name }}</option>
            }
          </select>
        </div>
        
        <div class="form-group">
          <label for="crop">Cultivo *</label>
          <select id="crop" [(ngModel)]="selectedCrop" name="crop" required>
            <option value="">Selecciona un cultivo</option>
            @for (crop of crops(); track crop.id) {
              <option [value]="crop.id">{{ crop.name }}</option>
            }
          </select>
        </div>
        
        <div class="form-group">
          <label for="planted_at">Fecha de siembra *</label>
          <input type="date" id="planted_at" [(ngModel)]="plantedAt" name="planted_at" required />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="quantity">Cantidad</label>
            <input type="number" id="quantity" [(ngModel)]="quantity" name="quantity" min="1" value="1" />
          </div>
          
          <div class="form-group">
            <label for="unit">Unidad</label>
            <select id="unit" [(ngModel)]="unit" name="unit">
              <option value="plants">Plantas</option>
              <option value="kg">Kilogramos</option>
              <option value="seeds">Semillas</option>
              <option value="rows">Filas</option>
            </select>
          </div>
        </div>
        
        <button type="submit" [disabled]="loading() || !isValid()">
          {{ loading() ? 'Guardando...' : 'Registrar Cultivo' }}
        </button>
        
        <button type="button" class="btn-cancel" (click)="goBack()">Cancelar</button>
      </form>
    </div>
  `,
  styles: [`
    .create-planting {
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    h2 {
      margin-bottom: 1.5rem;
      color: #2c3e50;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-row {
      display: flex;
      gap: 1rem;
      
      .form-group {
        flex: 1;
      }
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }
    
    input, select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      
      &:focus {
        outline: none;
        border-color: #3498db;
      }
      
      &:disabled {
        background: #f5f5f5;
      }
    }
    
    button {
      width: 100%;
      padding: 0.75rem;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
      
      &:hover:not(:disabled) {
        background: #2980b9;
      }
      
      &:disabled {
        background: #95a5a6;
        cursor: not-allowed;
      }
    }
    
    .btn-cancel {
      background: transparent;
      color: #7f8c8d;
      margin-top: 0.5rem;
      
      &:hover {
        color: #34495e;
        background: #ecf0f1;
      }
    }
    
    .error-message {
      background: #fee;
      color: #c0392b;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    
    .success-message {
      background: #efe;
      color: #27ae60;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    
    .loading {
      text-align: center;
      color: #666;
      padding: 1rem;
    }
  `]
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
  unit = 'plants';
  
  loading = signal(false);
  error = signal('');
  success = signal('');

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
    if (!this.isValid()) return;
    
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    const data: CreatePlantingRequest = {
      garden_id: this.selectedGarden,
      plot_id: this.selectedPlot,
      crop_id: this.selectedCrop,
      planted_at: this.plantedAt,
      quantity: this.quantity,
      unit: this.unit
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
