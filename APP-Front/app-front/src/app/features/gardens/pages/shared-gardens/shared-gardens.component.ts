import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GardenService, SharedGarden } from '../../services/garden.service';

@Component({
  selector: 'app-shared-gardens',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="shared-gardens">
      <header class="header">
        <h1 id="title">Huertas Compartidas</h1>
        <a routerLink="/gardens" class="btn-secondary">Mis Huertas</a>
      </header>

      @if (gardenService.loading()) {
        <div class="loading" role="status" aria-live="polite">
          <span class="spinner"></span>
          <span>Cargando huertas compartidas...</span>
        </div>
      }

      @if (gardenService.error()) {
        <div class="error-message" role="alert" aria-live="assertive">
          {{ gardenService.error() }}
        </div>
      }

      @if (!gardenService.loading() && sharedGardens().length === 0) {
        <div class="empty-state">
          <p>No tienes huertas compartidas todavía</p>
          <p class="hint">Las huertas que otros compartan contigo aparecerán aquí</p>
        </div>
      }

      @if (sharedGardens().length > 0) {
        <ul class="garden-grid" role="list" aria-label="Lista de huertas compartidas">
          @for (shared of sharedGardens(); track shared.garden_id) {
            <li class="garden-card">
              <a [routerLink]="['/gardens', shared.garden_id]" [attr.aria-label]="'Ver detalles de ' + shared.garden?.name">
                <div class="card-header">
                  <h2>{{ shared.garden?.name }}</h2>
                  <span class="role-badge" [class.pending]="!shared.invitation_accepted">
                    {{ getRoleLabel(shared.garden_role) }}
                  </span>
                </div>
                <div class="garden-info">
                  @if (shared.garden?.climate_zone) {
                    <span class="climate">
                      <span class="label">Clima:</span> {{ getClimateLabel(shared.garden!.climate_zone) }}
                    </span>
                  }
                  @if (shared.garden?.location?.city) {
                    <span class="location">
                      <span class="label">Ubicación:</span> {{ shared.garden?.location?.city }}
                    </span>
                  }
                  <span class="status">
                    @if (shared.invitation_accepted) {
                      <span class="accepted">✓ Invitación aceptada</span>
                    } @else {
                      <span class="pending">⏳ Invitación pendiente</span>
                    }
                  </span>
                </div>
              </a>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .shared-gardens {
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

      .hint {
        font-size: 0.9rem;
        color: var(--text-muted);
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
        align-items: flex-start;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }

      h2 {
        margin: 0;
        font-size: 1.25rem;
      }

      .role-badge {
        background: rgba(33, 150, 243, 0.15);
        color: #2196f3;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
        white-space: nowrap;

        &.pending {
          background: rgba(245, 124, 0, 0.15);
          color: #f57c00;
        }
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

        .status {
          margin-top: 0.5rem;
          font-size: 0.8rem;

          .accepted {
            color: var(--color-primary);
          }

          .pending {
            color: var(--color-accent);
          }
        }
      }
    }
  `]
})
export class SharedGardensComponent implements OnInit {
  gardenService = inject(GardenService);
  sharedGardens = this.gardenService.sharedGardens;

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

  roleLabels: Record<string, string> = {
    'collaborator': 'Colaborador',
    'viewer': 'Visualizador',
    'editor': 'Editor'
  };

  ngOnInit(): void {
    this.gardenService.getSharedGardens();
  }

  getClimateLabel(zone: string): string {
    return this.climateLabels[zone] || zone;
  }

  getRoleLabel(role: string): string {
    return this.roleLabels[role] || role;
  }
}
