import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlantingService, PlantingDetail } from '../../services/planting.service';

@Component({
  selector: 'app-planting-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="planting-detail">
      @if (plantingService.loading()) {
        <div class="loading">Cargando...</div>
      }
      
      @if (plantingService.error()) {
        <div class="error-message">{{ plantingService.error() }}</div>
      }
      
      @if (planting()) {
        <header class="planting-header">
          <div class="header-content">
            <a routerLink="/crops" class="back-link">← Volver</a>
            <h1>{{ planting()!.crop?.name || 'Cultivo' }}</h1>
          </div>
        </header>
        
        @if (planting()!.phenological) {
          <section class="phenological-status">
            <h2>Estado Fenológico</h2>
            
            <div class="phase-info">
              <div class="phase-badge" [class]="getPhaseClass(planting()!.phenological!.phase)">
                {{ planting()!.phenological!.phase }}
              </div>
              
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="planting()!.phenological!.progress"></div>
                </div>
                <span class="progress-text">{{ planting()!.phenological!.progress }}%</span>
              </div>
              
              <p class="description">{{ planting()!.phenological!.description }}</p>
            </div>
            
            <div class="days-info">
              <div class="day-item">
                <span class="day-label">Días transcurridos</span>
                <span class="day-value">{{ planting()!.phenological!.days_elapsed }}</span>
              </div>
              <div class="day-item">
                <span class="day-label">Días hasta cosecha</span>
                <span class="day-value">{{ planting()!.phenological!.days_to_harvest }}</span>
              </div>
            </div>
            
            <div class="harvest-text">
              {{ planting()!.phenological!.days_until_harvest_text }}
            </div>
          </section>
        }
        
        <section class="planting-info">
          <h2>Información</h2>
          <dl class="info-grid">
            <div class="info-item">
              <dt>Fecha de siembra</dt>
              <dd>{{ formatDate(planting()!.planted_at) }}</dd>
            </div>
            <div class="info-item">
              <dt>Cosecha esperada</dt>
              <dd>{{ formatDate(planting()!.expected_harvest_at) }}</dd>
            </div>
            <div class="info-item">
              <dt>Cantidad</dt>
              <dd>{{ planting()!.quantity }} {{ planting()!.unit }}</dd>
            </div>
            <div class="info-item">
              <dt>Estado</dt>
              <dd>{{ getStatusLabel(planting()!.status) }}</dd>
            </div>
          </dl>
        </section>
        
        @if (planting()!.actions && planting()!.actions!.length > 0) {
          <section class="actions-section">
            <h2>Acciones Recomendadas</h2>
            <ul class="actions-list">
              @for (action of planting()!.actions!; track action) {
                <li>{{ action }}</li>
              }
            </ul>
          </section>
        }
        
        @if (planting()!.status === 'planted') {
          <button class="btn-harvest" (click)="onHarvest()">
            Registrar Cosecha
          </button>
        }
      }
    </div>
  `,
  styles: [`
    .planting-detail {
      padding: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    
    .error-message {
      background: #fee;
      color: #c00;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    
    .planting-header {
      margin-bottom: 2rem;
    }
    
    .back-link {
      color: #3498db;
      text-decoration: none;
      font-size: 0.9rem;
      
      &:hover {
        text-decoration: underline;
      }
    }
    
    h1 {
      margin: 0.5rem 0;
      color: #2c3e50;
    }
    
    h2 {
      margin: 0 0 1rem;
      font-size: 1.25rem;
      color: #333;
    }
    
    .phenological-status {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .phase-info {
      margin-bottom: 1.5rem;
    }
    
    .phase-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      margin-bottom: 1rem;
      
      &.germinacion { background: #e8f5e9; color: #2e7d32; }
      &.crecimiento { background: #e3f2fd; color: #1565c0; }
      &.desarrollo { background: #fff3e0; color: #ef6c00; }
      &.floracion { background: #fce4ec; color: #c2185b; }
      &.fructificacion { background: #f1f8e9; color: #558b2f; }
      &.maduracion { background: #fff8e1; color: #f9a825; }
    }
    
    .progress-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .progress-bar {
      flex: 1;
      height: 12px;
      background: #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4caf50, #8bc34a);
      border-radius: 6px;
      transition: width 0.3s ease;
    }
    
    .progress-text {
      font-weight: 600;
      color: #333;
      min-width: 45px;
    }
    
    .description {
      color: #666;
      line-height: 1.5;
    }
    
    .days-info {
      display: flex;
      gap: 2rem;
      margin-bottom: 1rem;
    }
    
    .day-item {
      display: flex;
      flex-direction: column;
    }
    
    .day-label {
      font-size: 0.85rem;
      color: #888;
    }
    
    .day-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
    }
    
    .harvest-text {
      font-size: 1.1rem;
      font-weight: 600;
      color: #27ae60;
      padding: 0.75rem;
      background: #e8f5e9;
      border-radius: 4px;
    }
    
    .planting-info {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
    
    .actions-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .actions-list {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        padding: 0.75rem;
        border-bottom: 1px solid #eee;
        
        &:last-child {
          border-bottom: none;
        }
        
        &::before {
          content: "✓ ";
          color: #27ae60;
          font-weight: 600;
        }
      }
    }
    
    .btn-harvest {
      width: 100%;
      padding: 1rem;
      background: #27ae60;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      
      &:hover {
        background: #219a52;
      }
    }
  `]
})
export class PlantingDetailComponent implements OnInit {
  planting = signal<PlantingDetail | null>(null);
  harvestDate = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public plantingService: PlantingService
  ) {}

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
        }
      }
    });
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

  onHarvest(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && confirm('¿Registrar la cosecha de este cultivo?')) {
      this.plantingService.harvestPlanting(id, this.harvestDate).subscribe({
        next: (response) => {
          if (response?.success) {
            alert('Cosecha registrada correctamente');
            this.loadPlanting(id);
          }
        }
      });
    }
  }
}
