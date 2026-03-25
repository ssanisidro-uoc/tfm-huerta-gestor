import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GardenService, CreateGardenRequest } from '../../services/garden.service';

const CLIMATE_ZONES = [
  { value: 'mediterranean_coast', label: 'Costa Mediterránea' },
  { value: 'mediterranean_interior', label: 'Interior Mediterráneo' },
  { value: 'atlantic', label: 'Atlántico' },
  { value: 'continental', label: 'Continental' },
  { value: 'mountain', label: 'Montaña' },
  { value: 'subtropical', label: 'Subtropical' },
  { value: 'semiarid', label: 'Semiárido' },
  { value: 'canary_islands', label: 'Islas Canarias' }
];

@Component({
  selector: 'app-garden-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="garden-create">
      <div class="form-container">
        <h1 id="title">Crear Nueva Huerta</h1>
        
        @if (gardenService.error()) {
          <div class="error-message" role="alert" aria-live="assertive">
            {{ gardenService.error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" aria-labelledby="title">
          <!-- Campos obligatorios (visibles siempre) -->
          <div class="form-section">
            <div class="form-group">
              <label for="name">Nombre *</label>
              <input
                type="text"
                id="name"
                [(ngModel)]="name"
                name="name"
                required
                aria-required="true"
                [disabled]="gardenService.loading()"
                autocomplete="name"
                placeholder="Nombre de tu huerta"
              />
            </div>

            <div class="form-group">
              <label for="climate_zone">Zona Climática *</label>
              <select
                id="climate_zone"
                [(ngModel)]="climate_zone"
                name="climate_zone"
                required
                aria-required="true"
                [disabled]="gardenService.loading()"
              >
                <option value="">Selecciona una zona climática</option>
                @for (zone of climateZones; track zone.value) {
                  <option [value]="zone.value">{{ zone.label }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Campos opcionales (progressive disclosure) -->
          <div class="form-section">
            <button 
              type="button" 
              class="expand-toggle"
              (click)="showBasicFields.set(!showBasicFields())"
              [attr.aria-expanded]="showBasicFields()"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
                [class.rotated]="showBasicFields()"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              <span>{{ showBasicFields() ? 'Menos opciones' : 'Más opciones' }}</span>
            </button>

            @if (showBasicFields()) {
              <div class="expanded-fields">
                <div class="form-group">
                  <label for="description">Descripción</label>
                  <textarea
                    id="description"
                    [(ngModel)]="description"
                    name="description"
                    rows="2"
                    [disabled]="gardenService.loading()"
                    placeholder="Breve descripción de tu huerta"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label for="surface_m2">Superficie (m²)</label>
                  <input
                    type="number"
                    id="surface_m2"
                    [(ngModel)]="surface_m2"
                    name="surface_m2"
                    min="1"
                    max="1000000"
                    [disabled]="gardenService.loading()"
                    placeholder="Ej: 500"
                  />
                </div>
              </div>
            }
          </div>

          <!-- Ubicación (progressive disclosure - avanzado) -->
          <div class="form-section">
            <button 
              type="button" 
              class="expand-toggle advanced"
              (click)="showAdvancedFields.set(!showAdvancedFields())"
              [attr.aria-expanded]="showAdvancedFields()"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
                [class.rotated]="showAdvancedFields()"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              <span>{{ showAdvancedFields() ? 'Ocultar ubicación' : 'Añadir ubicación' }}</span>
            </button>

            @if (showAdvancedFields()) {
              <div class="expanded-fields advanced">
                <fieldset class="location-fieldset">
                  <legend>Ubicación</legend>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label for="location_city">Ciudad</label>
                      <input
                        type="text"
                        id="location_city"
                        [(ngModel)]="location_city"
                        name="location_city"
                        [disabled]="gardenService.loading()"
                        autocomplete="address-level2"
                      />
                    </div>

                    <div class="form-group">
                      <label for="location_region">Provincia/Región</label>
                      <input
                        type="text"
                        id="location_region"
                        [(ngModel)]="location_region"
                        name="location_region"
                        [disabled]="gardenService.loading()"
                        autocomplete="address-level1"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="location_address">Dirección</label>
                    <input
                      type="text"
                      id="location_address"
                      [(ngModel)]="location_address"
                      name="location_address"
                      [disabled]="gardenService.loading()"
                      autocomplete="street-address"
                    />
                  </div>
                </fieldset>
              </div>
            }
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn-primary"
              [disabled]="gardenService.loading()"
              [attr.aria-busy]="gardenService.loading()"
            >
              @if (gardenService.loading()) {
                <span class="spinner" aria-hidden="true"></span>
                <span>Creando...</span>
              } @else {
                Crear Huerta
              }
            </button>
            <a routerLink="/gardens" class="btn-secondary">Cancelar</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .garden-create {
      min-height: 100vh;
      background: var(--bg-primary);
      padding: 2rem 1rem;
    }

    .form-container {
      max-width: 600px;
      margin: 0 auto;
      background: var(--card-bg);
      padding: 2rem;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow);
    }

    h1 {
      margin: 0 0 1.5rem;
      color: var(--text-primary);
    }

    .error-message {
      background: var(--bg-tertiary);
      color: var(--color-error);
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }

    .form-section {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);

      &:last-of-type {
        border-bottom: none;
      }
    }

    .expand-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      color: var(--color-primary);
      font-size: 0.875rem;
      cursor: pointer;
      padding: 0.5rem 0;
      transition: color 0.2s;

      &:hover {
        color: var(--color-primary-hover);
      }

      &.advanced {
        color: var(--text-secondary);
      }

      svg {
        transition: transform 0.3s ease;

        &.rotated {
          transform: rotate(180deg);
        }
      }
    }

    .expanded-fields {
      margin-top: 1rem;
      padding: 1rem;
      background: var(--bg-primary);
      border-radius: 8px;
      animation: slideDown 0.3s ease;

      &.advanced {
        background: var(--bg-tertiary);
      }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .form-group {
      margin-bottom: 1rem;

      &:last-child {
        margin-bottom: 0;
      }
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
      font-weight: 500;
      font-size: 0.875rem;
    }

    input, select, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
      font-family: inherit;
      background: var(--bg-secondary);
      color: var(--text-primary);

      &:focus {
        outline: none;
        border-color: var(--color-primary);
      }

      &:disabled {
        background: var(--bg-tertiary);
        opacity: 0.7;
      }

      &::placeholder {
        color: var(--text-muted);
      }
    }

    textarea {
      resize: vertical;
    }

    .location-fieldset {
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 1rem;
      margin: 0;

      legend {
        font-weight: 500;
        color: var(--text-primary);
        padding: 0 0.5rem;
        font-size: 0.875rem;
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;

      @media (max-width: 500px) {
        grid-template-columns: 1fr;
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
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
      border: none;

      &:hover:not(:disabled) {
        background: var(--color-primary-hover);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .btn-secondary {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);

      &:hover {
        background: var(--border-color);
      }
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class GardenCreateComponent {
  gardenService = inject(GardenService);
  private router = inject(Router);

  name = '';
  description = '';
  climate_zone = '';
  surface_m2: number | null = null;
  location_city = '';
  location_region = '';
  location_address = '';

  showBasicFields = signal(false);
  showAdvancedFields = signal(false);

  climateZones = CLIMATE_ZONES;

  onSubmit(): void {
    if (!this.name || !this.climate_zone) {
      return;
    }

    const data: CreateGardenRequest = {
      name: this.name,
      description: this.description || undefined,
      climate_zone: this.climate_zone,
      surface_m2: this.surface_m2 ?? undefined
    };

    if (this.location_city || this.location_region || this.location_address) {
      data.location = {
        city: this.location_city || undefined,
        region: this.location_region || undefined,
        address: this.location_address || undefined,
        country: 'Spain'
      };
    }

    this.gardenService.createGarden(data).subscribe({
      next: (response) => {
        if (response) {
          this.router.navigate(['/gardens']);
        }
      }
    });
  }
}