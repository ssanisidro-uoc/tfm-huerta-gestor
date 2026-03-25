import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PlotService, PlotDetail } from '../../services/plot.service';

@Component({
  selector: 'app-plot-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="plot-detail">
      @if (plotService.loading()) {
        <div class="loading" role="status">
          <span class="spinner"></span>
          <span>Cargando...</span>
        </div>
      }

      @if (plotService.error()) {
        <div class="error-message" role="alert">{{ plotService.error() }}</div>
      }

      @if (plot()) {
        <header class="plot-header">
          <div>
            <a [routerLink]="['/gardens', plot()!.garden_id]" class="back-link">← Volver a la huerta</a>
            <h1 id="title">{{ plot()!.name }}</h1>
            @if (plot()!.code) {
              <span class="plot-code">{{ plot()!.code }}</span>
            }
          </div>
        </header>

        <section class="plot-info" aria-labelledby="info-title">
          <h2 id="info-title">Información</h2>
          <dl class="info-grid">
            <div class="info-item">
              <dt>Superficie</dt>
              <dd>{{ plot()!.surface_m2 }} m²</dd>
            </div>
            <div class="info-item">
              <dt>Tipo de Riego</dt>
              <dd>{{ getIrrigationLabel(plot()!.irrigation_type) }}</dd>
            </div>
            <div class="info-item">
              <dt>Acceso a Agua</dt>
              <dd>{{ plot()!.has_water_access ? 'Sí' : 'No' }}</dd>
            </div>
            <div class="info-item">
              <dt>Estado</dt>
              <dd>{{ plot()!.is_active ? 'Activa' : 'Inactiva' }}</dd>
            </div>
          </dl>
        </section>

        <section class="plot-features" aria-labelledby="features-title">
          <h2 id="features-title">Características</h2>
          <ul class="features-list">
            @if (plot()!.has_greenhouse) {
              <li class="feature-badge greenhouse">Invernadero</li>
            }
            @if (plot()!.has_raised_bed) {
              <li class="feature-badge raised-bed">Bancal Elevado</li>
            }
            @if (plot()!.has_mulch) {
              <li class="feature-badge mulch">Acolchado</li>
            }
            @if (!plot()!.has_greenhouse && !plot()!.has_raised_bed && !plot()!.has_mulch) {
              <li class="feature-badge none">Sin características especiales</li>
            }
          </ul>
        </section>

        @if (plot()!.description) {
          <section class="plot-description">
            <h2>Descripción</h2>
            <p>{{ plot()!.description }}</p>
          </section>
        }
      }
    </div>
  `,
  styles: [`
    .plot-detail {
      padding: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .loading {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      color: #666;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #ddd;
      border-top-color: #007bff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-message {
      background: #fee;
      color: #c00;
      padding: 1rem;
      border-radius: 6px;
    }

    .plot-header {
      margin-bottom: 2rem;
    }

    .back-link {
      color: #007bff;
      text-decoration: none;
      font-size: 0.9rem;
      
      &:hover {
        text-decoration: underline;
      }
    }

    h1 {
      margin: 0.5rem 0;
      color: #333;
    }

    .plot-code {
      display: inline-block;
      background: #e9ecef;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.9rem;
      color: #666;
    }

    .plot-info, .plot-features, .plot-description {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      h2 {
        margin: 0 0 1rem;
        font-size: 1.1rem;
        color: #333;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
      margin: 0;
    }

    .info-item {
      dt {
        color: #888;
        font-size: 0.85rem;
        margin-bottom: 0.25rem;
      }

      dd {
        margin: 0;
        color: #333;
        font-weight: 500;
      }
    }

    .features-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .feature-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .greenhouse, .raised-bed, .mulch {
      background: #e3f2fd;
      color: #1565c0;
    }

    .none {
      background: #f5f5f5;
      color: #666;
    }

    .plot-description p {
      margin: 0;
      color: #555;
      line-height: 1.6;
    }
  `]
})
export class PlotDetailComponent implements OnInit {
  plot = signal<PlotDetail | null>(null);
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
    public plotService: PlotService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPlot(id);
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

  getIrrigationLabel(type: string): string {
    return this.irrigationLabels[type] || type;
  }
}
