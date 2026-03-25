import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PlotService, Plot } from '../../services/plot.service';

@Component({
  selector: 'app-plot-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="plot-list">
      <header class="header">
        <a [routerLink]="['/gardens', gardenId]" class="back-link">← Volver a la huerta</a>
        <h1 id="title">Parcelas</h1>
        <a [routerLink]="['/gardens', gardenId, 'plots', 'create']" class="btn-primary" aria-label="Crear nueva parcela">
          + Nueva Parcela
        </a>
      </header>

      @if (plotService.loading()) {
        <div class="loading" role="status" aria-live="polite">
          <span class="spinner"></span>
          <span>Cargando parcelas...</span>
        </div>
      }

      @if (plotService.error()) {
        <div class="error-message" role="alert">{{ plotService.error() }}</div>
      }

      @if (!plotService.loading() && plotService.plots().length === 0) {
        <div class="empty-state">
          <p>No hay parcelas todavía</p>
          <a [routerLink]="['/gardens', gardenId, 'plots', 'create']" class="btn-primary">
            Crear tu primera parcela
          </a>
        </div>
      }

      @if (plotService.plots().length > 0) {
        <ul class="plot-grid" role="list">
          @for (plot of plotService.plots(); track plot.id) {
            <li class="plot-card">
              <a [routerLink]="['/plots', plot.id]">
                <h2>{{ plot.name }}</h2>
                @if (plot.code) {
                  <span class="plot-code">{{ plot.code }}</span>
                }
                @if (plot.description) {
                  <p class="description">{{ plot.description }}</p>
                }
                <div class="plot-info">
                  <span class="surface">{{ plot.surface_m2 }} m²</span>
                </div>
              </a>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .plot-list {
      padding: 1.5rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 1.5rem;
    }

    .back-link {
      display: inline-block;
      color: #007bff;
      text-decoration: none;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      
      &:hover {
        text-decoration: underline;
      }
    }

    h1 {
      margin: 0.5rem 0;
      color: #333;
    }

    .header .btn-primary {
      float: right;
      margin-top: -2.5rem;
    }

    .loading {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      color: #666;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #ddd;
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

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
      background: white;
      border-radius: 8px;

      p {
        margin-bottom: 1rem;
      }
    }

    .btn-primary {
      background: #007bff;
      color: white;
      padding: 0.75rem 1.25rem;
      border-radius: 6px;
      text-decoration: none;
      display: inline-block;

      &:hover {
        background: #0056b3;
      }
    }

    .plot-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.25rem;
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .plot-card a {
      display: block;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1.25rem;
      text-decoration: none;
      color: inherit;
      transition: box-shadow 0.2s, transform 0.2s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      h2 {
        margin: 0 0 0.5rem;
        font-size: 1.1rem #333;
     ;
        color: }

      .plot-code {
        display: inline-block;
        background: #e9ecef;
        padding: 0.125rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        color: #666;
        margin-bottom: 0.5rem;
      }

      .description {
        color: #666;
        font-size: 0.9rem;
        margin: 0 0 1rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .plot-info {
        font-size: 0.9rem;
        color: #555;
      }
    }
  `]
})
export class PlotListComponent implements OnInit {
  gardenId = '';

  constructor(
    private route: ActivatedRoute,
    public plotService: PlotService
  ) {}

  ngOnInit(): void {
    this.gardenId = this.route.snapshot.paramMap.get('gardenId') || '';
    if (this.gardenId) {
      this.plotService.getPlotsByGarden(this.gardenId);
    }
  }
}
