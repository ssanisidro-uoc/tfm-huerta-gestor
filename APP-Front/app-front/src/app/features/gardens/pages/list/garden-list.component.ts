import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GardenService, Garden } from '../../services/garden.service';

@Component({
  selector: 'app-garden-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="garden-list">
      <header class="header">
        <h1 id="title">Mis Huertas</h1>
        <div class="header-actions">
          <a routerLink="/gardens/shared" class="btn-secondary" aria-label="Ver huertas compartidas">
            Compartidas
          </a>
          <a routerLink="/gardens/create" class="btn-primary" aria-label="Crear nueva huerta">
            + Nueva Huerta
          </a>
        </div>
      </header>

      @if (gardenService.loading()) {
        <div class="loading" role="status" aria-live="polite">
          <span class="spinner"></span>
          <span>Cargando huertas...</span>
        </div>
      }

      @if (gardenService.error()) {
        <div class="error-message" role="alert" aria-live="assertive">
          {{ gardenService.error() }}
        </div>
      }

      @if (!gardenService.loading() && gardenService.gardens().length === 0) {
        <div class="empty-state">
          <p>No tienes huertas todavía</p>
          <a routerLink="/gardens/create" class="btn-primary">Crear tu primera huerta</a>
        </div>
      }

      @if (gardenService.gardens().length > 0) {
        <ul class="garden-grid" role="list" aria-label="Lista de huertas">
          @for (garden of gardenService.gardens(); track garden.id) {
            <li class="garden-card">
              <a [routerLink]="['/gardens', garden.id]" [attr.aria-label]="'Ver detalles de ' + garden.name">
                <div class="card-header">
                  <h2>{{ garden.name }}</h2>
                  @if (garden.is_active) {
                    <span class="status-badge active">Activa</span>
                  }
                </div>
                @if (garden.description) {
                  <p class="description">{{ garden.description }}</p>
                }
                <div class="garden-info">
                  <span class="climate">
                    <span class="label">Clima:</span> {{ getClimateLabel(garden.climate_zone) }}
                  </span>
                  @if (garden.surface_m2) {
                    <span class="surface">
                      <span class="label">Superficie:</span> {{ garden.surface_m2 }} m²
                    </span>
                  }
                  @if (garden.location.city) {
                    <span class="location">
                      <span class="label">Ubicación:</span> {{ garden.location.city }}
                    </span>
                  }
                </div>
              </a>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .garden-list {
      padding: 0;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;

      h1 {
        margin: 0;
        font-size: 1.5rem;
      }
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
      padding: 0.75rem 1.25rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      transition: background 0.2s;

      &:hover {
        background: var(--color-primary-hover);
      }
    }

    .btn-secondary {
      background: var(--text-muted);
      color: white;
      padding: 0.75rem 1.25rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      transition: background 0.2s;

      &:hover {
        background: var(--text-secondary);
      }
    }

    .loading {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border-color);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-message {
      background: var(--bg-tertiary);
      color: var(--color-error);
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;

      p {
        margin-bottom: 1rem;
      }
    }

    .garden-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .garden-card {
      a {
        display: block;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1.25rem;
        text-decoration: none;
        color: inherit;
        transition: all 0.2s ease;

        &:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;

        h2 {
          margin: 0;
          font-size: 1.25rem;
        }
      }

      .status-badge {
        font-size: 0.7rem;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-weight: 500;

        &.active {
          background: rgba(46, 125, 50, 0.15);
          color: var(--color-primary);
        }
      }

      .description {
        color: var(--text-secondary);
        margin: 0 0 1rem;
        font-size: 0.9rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .garden-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.85rem;

        .label {
          color: var(--text-muted);
          font-weight: 500;
        }
      }
    }
  `]
})
export class GardenListComponent implements OnInit {
  gardenService = inject(GardenService);

  climateLabels: Record<string, string> = {
    'mediterranean_coast': 'Costa Mediterránea',
    'mediterranean_interior': 'Interior Mediterráneo',
    'atlantic': 'Atlántico',
    'continental': 'Continental',
    'mountain': 'Montaña',
    'subtropical': 'Subtropical',
    'semiarid': 'Semiárido',
    'canary_islands': 'Islas Canarias'
  };

  ngOnInit(): void {
    this.gardenService.getGardens();
  }

  getClimateLabel(zone: string): string {
    return this.climateLabels[zone] || zone;
  }
}