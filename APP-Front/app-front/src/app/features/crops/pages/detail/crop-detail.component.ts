import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CropService, CropDetail } from '../../services/crop.service';

@Component({
  selector: 'app-crop-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="crop-detail">
      @if (cropService.loading()) {
        <div class="loading" role="status"><span class="spinner"></span>Cargando...</div>
      }
      @if (cropService.error()) {
        <div class="error-message" role="alert">{{ cropService.error() }}</div>
      }
      @if (crop()) {
        <header class="crop-header">
          <a routerLink="/crops" class="back-link">← Volver al catálogo</a>
          <h1 id="title">{{ crop()!.name }}</h1>
          @if (crop()!.scientific_name) {
            <p class="scientific">{{ crop()!.scientific_name }}</p>
          }
        </header>
        <section class="crop-info">
          <h2>Información General</h2>
          <dl class="info-grid">
            <div class="info-item"><dt>Familia</dt><dd>{{ crop()!.family }}</dd></div>
            <div class="info-item"><dt>Categoría</dt><dd>{{ crop()!.category }}</dd></div>
            <div class="info-item"><dt>Días hasta cosecha</dt><dd>{{ crop()!.days_to_harvest_min }} - {{ crop()!.days_to_harvest_max }} días</dd></div>
            <div class="info-item"><dt>Necesidad de sol</dt><dd>{{ crop()!.sun_requirement }}</dd></div>
            <div class="info-item"><dt>Necesidad de agua</dt><dd>{{ crop()!.water_requirement }}</dd></div>
          </dl>
        </section>
      }
    </div>
  `,
  styles: [`
    .crop-detail { padding: 1.5rem; max-width: 800px; margin: 0 auto; }
    .loading { display: flex; align-items: center; gap: 0.75rem; padding: 2rem; color: #666; }
    .spinner { width: 24px; height: 24px; border: 3px solid #ddd; border-top-color: #007bff; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error-message { background: #fee; color: #c00; padding: 1rem; border-radius: 6px; }
    .crop-header { margin-bottom: 2rem; }
    .back-link { color: #007bff; text-decoration: none; font-size: 0.9rem; }
    .back-link:hover { text-decoration: underline; }
    h1 { margin: 0.5rem 0; color: #333; }
    .scientific { color: #888; font-style: italic; margin: 0; }
    .crop-info { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .crop-info h2 { margin: 0 0 1rem; font-size: 1.1rem; color: #333; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; }
    .info-item dt { color: #888; font-size: 0.85rem; margin-bottom: 0.25rem; }
    .info-item dd { margin: 0; color: #333; font-weight: 500; }
  `]
})
export class CropDetailComponent implements OnInit {
  crop = signal<CropDetail | null>(null);

  constructor(
    private route: ActivatedRoute,
    public cropService: CropService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadCrop(id);
  }

  loadCrop(id: string): void {
    this.cropService.getCropById(id).subscribe({
      next: (c) => { if (c) this.crop.set(c); }
    });
  }
}
