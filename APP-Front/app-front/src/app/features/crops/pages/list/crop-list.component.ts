import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CropService, Crop } from '../../services/crop.service';

@Component({
  selector: 'app-crop-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="crop-list">
      <header class="header">
        <h1 id="title">Catálogo de Cultivos</h1>
      </header>

      @if (cropService.loading()) {
        <div class="loading" role="status" aria-live="polite">
          <span class="spinner"></span>
          <span>Cargando cultivos...</span>
        </div>
      }

      @if (cropService.error()) {
        <div class="error-message" role="alert">{{ cropService.error() }}</div>
      }

      @if (!cropService.loading() && cropService.crops().length === 0) {
        <div class="empty-state">
          <p>No hay cultivos disponibles</p>
        </div>
      }

      @if (cropService.crops().length > 0) {
        <ul class="crop-grid" role="list">
          @for (crop of cropService.crops(); track crop.id) {
            <li class="crop-card">
              <a [routerLink]="['/crops', crop.id]">
                <h2>{{ crop.name }}</h2>
                @if (crop.scientific_name) {
                  <p class="scientific">{{ crop.scientific_name }}</p>
                }
                <div class="crop-info">
                  <span class="badge family">{{ crop.family }}</span>
                  <span class="badge category">{{ getCategoryLabel(crop.category) }}</span>
                </div>
                <p class="days">{{ crop.days_to_harvest_min }} - {{ crop.days_to_harvest_max }} días</p>
              </a>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .crop-list { padding: 1.5rem; max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 1.5rem; }
    h1 { margin: 0; color: #333; }
    .loading { display: flex; align-items: center; gap: 0.75rem; padding: 2rem; color: #666; }
    .spinner { width: 20px; height: 20px; border: 2px solid #ddd; border-top-color: #007bff; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error-message { background: #fee; color: #c00; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; }
    .empty-state { text-align: center; padding: 3rem; color: #666; }
    .crop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.25rem; list-style: none; padding: 0; margin: 0; }
    .crop-card a { display: block; background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.25rem; text-decoration: none; color: inherit; transition: box-shadow 0.2s, transform 0.2s; }
    .crop-card a:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
    .crop-card h2 { margin: 0 0 0.25rem; font-size: 1.1rem; color: #333; }
    .scientific { color: #888; font-style: italic; font-size: 0.85rem; margin: 0 0 0.75rem; }
    .crop-info { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
    .badge { background: #e9ecef; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; color: #555; }
    .days { margin: 0; color: #666; font-size: 0.9rem; }
  `]
})
export class CropListComponent implements OnInit {
  categoryLabels: Record<string, string> = {
    'vegetable': 'Hortaliza',
    'fruit': 'Fruta',
    'herb': 'Hierba',
    'flower': 'Flor',
    'cereal': 'Cereal',
    'legume': 'Legumbre'
  };

  constructor(public cropService: CropService) {}

  ngOnInit(): void {
    this.cropService.getCrops();
  }

  getCategoryLabel(category: string): string {
    return this.categoryLabels[category] || category;
  }
}
