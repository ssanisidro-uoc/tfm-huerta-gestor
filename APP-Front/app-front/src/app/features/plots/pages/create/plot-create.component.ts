import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlotService, CreatePlotRequest } from '../../services/plot.service';

const SOIL_TYPES = [
  { value: 'clay', label: 'Arcilloso' },
  { value: 'sandy', label: 'Arenoso' },
  { value: 'loamy', label: 'Franco' },
  { value: 'silty', label: 'Limoso' },
  { value: 'chalky', label: 'Calcáreo' },
  { value: 'humus_rich', label: 'Humífero' },
  { value: 'rocky', label: 'Pedregoso' },
  { value: 'mixed', label: 'Mixto' },
  { value: 'unknown', label: 'Desconocido' }
];

const IRRIGATION_TYPES = [
  { value: 'manual', label: 'Manual' },
  { value: 'drip', label: 'Goteo' },
  { value: 'sprinkler', label: 'Aspersión' },
  { value: 'flood', label: 'Inundación' },
  { value: 'subsurface', label: 'Subterráneo' },
  { value: 'automatic', label: 'Automático' },
  { value: 'rainfed', label: 'Secano (solo lluvia)' }
];

@Component({
  selector: 'app-plot-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="plot-create">
      <div class="form-container">
        <h1 id="title">Crear Nueva Parcela</h1>
        
        @if (plotService.error()) {
          <div class="error-message" role="alert">{{ plotService.error() }}</div>
        }

        <form (ngSubmit)="onSubmit()" aria-labelledby="title">
          <div class="form-group">
            <label for="name">Nombre *</label>
            <input
              type="text"
              id="name"
              [(ngModel)]="name"
              name="name"
              required
              aria-required="true"
              [disabled]="plotService.loading()"
            />
          </div>

          <div class="form-group">
            <label for="code">Código</label>
            <input
              type="text"
              id="code"
              [(ngModel)]="code"
              name="code"
              placeholder="ej: P1, A-01"
              [disabled]="plotService.loading()"
            />
          </div>

          <div class="form-group">
            <label for="surface_m2">Superficie (m²) *</label>
            <input
              type="number"
              id="surface_m2"
              [(ngModel)]="surface_m2"
              name="surface_m2"
              required
              min="1"
              aria-required="true"
              [disabled]="plotService.loading()"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="length_m">Largo (m)</label>
              <input
                type="number"
                id="length_m"
                [(ngModel)]="length_m"
                name="length_m"
                min="0.1"
                step="0.1"
                [disabled]="plotService.loading()"
              />
            </div>

            <div class="form-group">
              <label for="width_m">Ancho (m)</label>
              <input
                type="number"
                id="width_m"
                [(ngModel)]="width_m"
                name="width_m"
                min="0.1"
                step="0.1"
                [disabled]="plotService.loading()"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea
              id="description"
              [(ngModel)]="description"
              name="description"
              rows="2"
              [disabled]="plotService.loading()"
            ></textarea>
          </div>

          <fieldset class="soil-fieldset">
            <legend>Suelo</legend>
            
            <div class="form-row">
              <div class="form-group">
                <label for="soil_type">Tipo de Suelo</label>
                <select id="soil_type" [(ngModel)]="soil_type" name="soil_type" [disabled]="plotService.loading()">
                  <option value="">Selecciona tipo</option>
                  @for (type of soilTypes; track type.value) {
                    <option [value]="type.value">{{ type.label }}</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label for="soil_ph">pH del Suelo</label>
                <input
                  type="number"
                  id="soil_ph"
                  [(ngModel)]="soil_ph"
                  name="soil_ph"
                  min="0"
                  max="14"
                  step="0.1"
                  [disabled]="plotService.loading()"
                />
              </div>
            </div>
          </fieldset>

          <fieldset class="irrigation-fieldset">
            <legend>Riego</legend>
            
            <div class="form-group">
              <label for="irrigation_type">Tipo de Riego</label>
              <select id="irrigation_type" [(ngModel)]="irrigation_type" name="irrigation_type" [disabled]="plotService.loading()">
                @for (type of irrigationTypes; track type.value) {
                  <option [value]="type.value">{{ type.label }}</option>
                }
              </select>
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="has_water_access" name="has_water_access" [disabled]="plotService.loading()" />
                Acceso a agua
              </label>
            </div>
          </fieldset>

          <fieldset class="features-fieldset">
            <legend>Características</legend>
            
            <div class="checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="has_greenhouse" name="has_greenhouse" [disabled]="plotService.loading()" />
                Invernadero
              </label>
              <label>
                <input type="checkbox" [(ngModel)]="has_raised_bed" name="has_raised_bed" [disabled]="plotService.loading()" />
                Bancal Elevado
              </label>
              <label>
                <input type="checkbox" [(ngModel)]="has_mulch" name="has_mulch" [disabled]="plotService.loading()" />
                Acolchado
              </label>
            </div>
          </fieldset>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn-primary"
              [disabled]="plotService.loading()"
              [attr.aria-busy]="plotService.loading()"
            >
              @if (plotService.loading()) {
                <span class="spinner" aria-hidden="true"></span>
                <span>Creando...</span>
              } @else {
                Crear Parcela
              }
            </button>
            <a [routerLink]="['/gardens', gardenId]" class="btn-secondary">Cancelar</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .plot-create {
      min-height: 100vh;
      background: #f5f5f5;
      padding: 2rem 1rem;
    }

    .form-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      margin: 0 0 1.5rem;
      color: #333;
    }

    .error-message {
      background: #fee;
      color: #c00;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }

    input[type="text"],
    input[type="number"],
    select,
    textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
      font-family: inherit;

      &:focus {
        outline: none;
        border-color: #007bff;
      }

      &:disabled {
        background: #f5f5f5;
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    fieldset {
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 1.25rem;

      legend {
        font-weight: 500;
        color: #555;
        padding: 0 0.5rem;
      }
    }

    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;

      label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: normal;
        cursor: pointer;

        input[type="checkbox"] {
          width: auto;
        }
      }
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      border: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &:hover:not(:disabled) {
        background: #0056b3;
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .btn-secondary {
      background: #f0f0f0;
      color: #333;

      &:hover {
        background: #e0e0e0;
      }
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #fff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PlotCreateComponent {
  gardenId = '';
  name = '';
  code = '';
  surface_m2: number | null = null;
  length_m: number | null = null;
  width_m: number | null = null;
  description = '';
  soil_type = '';
  soil_ph: number | null = null;
  irrigation_type = 'manual';
  has_water_access = true;
  has_greenhouse = false;
  has_raised_bed = false;
  has_mulch = false;

  soilTypes = SOIL_TYPES;
  irrigationTypes = IRRIGATION_TYPES;

  constructor(
    private route: ActivatedRoute,
    public plotService: PlotService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.gardenId = this.route.snapshot.paramMap.get('gardenId') || '';
  }

  onSubmit(): void {
    if (!this.name || !this.surface_m2 || !this.gardenId) {
      return;
    }

    const data: CreatePlotRequest = {
      name: this.name,
      code: this.code || undefined,
      surface_m2: this.surface_m2,
      description: this.description || undefined,
      length_m: this.length_m ?? undefined,
      width_m: this.width_m ?? undefined,
      soil_type: this.soil_type || undefined,
      soil_ph: this.soil_ph ?? undefined,
      irrigation_type: this.irrigation_type,
      has_water_access: this.has_water_access,
      has_greenhouse: this.has_greenhouse,
      has_raised_bed: this.has_raised_bed,
      has_mulch: this.has_mulch
    };

    this.plotService.createPlot(this.gardenId, data).subscribe({
      next: (response) => {
        if (response) {
          this.router.navigate(['/gardens', this.gardenId]);
        }
      }
    });
  }
}
