import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GardenService, GardenDetail, CreateGardenRequest } from '../../services/garden.service';
import { PlotService, Plot } from '../../../plots/services/plot.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-garden-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BreadcrumbComponent],
  template: `
    <div class="garden-detail">
      @if (garden()) {
        <app-breadcrumb [items]="breadcrumbs()"></app-breadcrumb>
      }

      @if (gardenService.loading()) {
        <div class="loading" role="status" aria-live="polite">
          <span class="spinner"></span>
          <span>Cargando...</span>
        </div>
      }

      @if (gardenService.error()) {
        <div class="error-message" role="alert">{{ gardenService.error() }}</div>
      }

      @if (garden()) {
        <header class="garden-header">
          <div class="header-content">
            <a routerLink="/gardens" class="back-link" aria-label="Volver a huertas">← Volver</a>
            <h1 id="title">{{ garden()!.name }}</h1>
            @if (garden()!.description) {
              <p class="description">{{ garden()!.description }}</p>
            }
          </div>
          <div class="header-actions">
            <button class="btn-secondary" (click)="startEdit()" aria-label="Editar huerta">
              Editar
            </button>
            <button class="btn-invite" (click)="startInvite()" aria-label="Invitar colaborador">
              + Invitar
            </button>
            <button class="btn-danger" (click)="onDelete()" aria-label="Eliminar huerta">
              Eliminar
            </button>
          </div>
        </header>

      @if (isEditing()) {
        <section class="edit-form">
          <h2>Editar Huerta</h2>
          <form (ngSubmit)="saveEdit()">
            <div class="form-group">
              <label for="name">Nombre</label>
              <input type="text" id="name" [(ngModel)]="editForm.name" name="name" required />
            </div>
            <div class="form-group">
              <label for="description">Descripción</label>
              <textarea id="description" [(ngModel)]="editForm.description" name="description" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label for="climate">Zona Climática</label>
              <select id="climate" [(ngModel)]="editForm.climate_zone" name="climate_zone">
                <option value="mediterranean_coast">Costa Mediterránea</option>
                <option value="mediterranean_interior">Interior Mediterráneo</option>
                <option value="atlantic">Atlántico</option>
                <option value="continental">Continental</option>
                <option value="mountain">Montaña</option>
                <option value="subtropical">Subtropical</option>
                <option value="semiarid">Semiárido</option>
                <option value="canary_islands">Islas Canarias</option>
              </select>
            </div>
            <div class="form-group">
              <label for="surface">Superficie (m²)</label>
              <input type="number" id="surface" [(ngModel)]="editForm.surface_m2" name="surface_m2" />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">Guardar</button>
              <button type="button" class="btn-secondary" (click)="cancelEdit()">Cancelar</button>
            </div>
            @if (editMessage()) {
              <div class="success-message">{{ editMessage() }}</div>
            }
          </form>
        </section>
      }

      @if (isInviting()) {
        <section class="invite-form">
          <h2>Invitar Colaborador</h2>
          <form (ngSubmit)="sendInvite()">
            <div class="form-group">
              <label for="email">Email del colaborador</label>
              <input type="email" id="email" [(ngModel)]="inviteEmail" name="email" required placeholder="colaborador@email.com" />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">Enviar Invitación</button>
              <button type="button" class="btn-secondary" (click)="cancelInvite()">Cancelar</button>
            </div>
            @if (inviteMessage()) {
              <div class="success-message">{{ inviteMessage() }}</div>
            }
          </form>
        </section>
      }

        <section class="garden-info" aria-labelledby="info-title">
          <h2 id="info-title">Información</h2>
          <dl class="info-grid">
            <div class="info-item">
              <dt>Zona Climática</dt>
              <dd>{{ getClimateLabel(garden()!.climate_zone) }}</dd>
            </div>
            @if (garden()!.surface_m2) {
              <div class="info-item">
                <dt>Superficie</dt>
                <dd>{{ garden()!.surface_m2 }} m²</dd>
              </div>
            }
            @if (garden()!.hardiness_zone) {
              <div class="info-item">
                <dt>Zona de Rusticidad</dt>
                <dd>{{ garden()!.hardiness_zone }}</dd>
              </div>
            }
            @if (garden()!.location.city || garden()!.location.region) {
              <div class="info-item">
                <dt>Ubicación</dt>
                <dd>
                  {{ garden()!.location.city }}{{ garden()!.location.city && garden()!.location.region ? ', ' : '' }}{{ garden()!.location.region }}
                </dd>
              </div>
            }
            <div class="info-item">
              <dt>Estado</dt>
              <dd>{{ garden()!.is_active ? 'Activa' : 'Inactiva' }}</dd>
            </div>
          </dl>
        </section>

        <section class="plots-section" aria-labelledby="plots-title">
          <div class="plots-header">
            <h2 id="plots-title">Parcelas</h2>
            <a [routerLink]="['/gardens', garden()!.id, 'plots', 'create']" class="btn-primary" aria-label="Crear nueva parcela">
              + Nueva Parcela
            </a>
          </div>

          @if (plotService.loading()) {
            <div class="loading-small">
              <span class="spinner-small"></span>
            </div>
          }

          @if (!plotService.loading() && plotService.plots().length === 0) {
            <div class="empty-plots">
              <p>No hay parcelas en esta huerta</p>
            </div>
          }

          @if (plotService.plots().length > 0) {
            <ul class="plots-list" role="list" aria-label="Parcelas">
              @for (plot of plotService.plots(); track plot.id) {
                <li class="plot-card">
                  <a [routerLink]="['/plots', plot.id]">
                    <h3>{{ plot.name }}</h3>
                    @if (plot.code) {
                      <span class="plot-code">{{ plot.code }}</span>
                    }
                    <p class="plot-surface">{{ plot.surface_m2 }} m²</p>
                  </a>
                </li>
              }
            </ul>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .garden-detail {
      padding: 1.5rem;
      max-width: 900px;
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

    .spinner-small {
      width: 16px;
      height: 16px;
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

    .garden-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .back-link {
      color: #007bff;
      text-decoration: none;
      font-size: 0.9rem;
      
      &:hover {
        text-decoration: underline;
      }
    }

    .header-content h1 {
      margin: 0.5rem 0;
      color: #333;
    }

    .description {
      color: #666;
      margin: 0;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;

      &:hover {
        background: #c82333;
      }
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;

      &:hover {
        background: #5a6268;
      }
    }

    .btn-invite {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;

      &:hover {
        background: #218838;
      }
    }

    .edit-form, .invite-form {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      h2 {
        margin: 0 0 1rem;
        font-size: 1.25rem;
        color: #333;
      }
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

    .plots-section {
      h2 {
        margin: 0;
        color: #333;
      }
    }

    .plots-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      text-decoration: none;

      &:hover {
        background: #0056b3;
      }
    }

    .empty-plots {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      color: #666;
    }

    .plots-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .plot-card a {
      display: block;
      background: white;
      padding: 1rem;
      border-radius: 8px;
      text-decoration: none;
      color: inherit;
      border: 1px solid #e0e0e0;
      transition: box-shadow 0.2s;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      h3 {
        margin: 0 0 0.5rem;
        font-size: 1rem;
        color: #333;
      }

      .plot-code {
        display: inline-block;
        background: #e9ecef;
        padding: 0.125rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        color: #666;
        margin-bottom: 0.5rem;
      }

      .plot-surface {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
      }
    }
  `]
})
export class GardenDetailComponent implements OnInit {
  garden = signal<GardenDetail | null>(null);
  isEditing = signal(false);
  isInviting = signal(false);
  
  breadcrumbs = signal<BreadcrumbItem[]>([]);
  
  editForm: Partial<CreateGardenRequest> = {};
  inviteEmail = '';
  inviteMessage = signal('');
  editMessage = signal('');
  
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public gardenService: GardenService,
    public plotService: PlotService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGarden(id);
      this.loadPlots(id);
    }
  }

  loadGarden(id: string): void {
    this.gardenService.getGardenById(id).subscribe({
      next: (garden) => {
        if (garden) {
          this.garden.set(garden);
          this.breadcrumbs.set([
            { label: 'Huertas', routerLink: '/gardens' },
            { label: garden.name }
          ]);
        }
      }
    });
  }

  loadPlots(gardenId: string): void {
    this.plotService.getPlotsByGarden(gardenId);
  }

  getClimateLabel(zone: string): string {
    return this.climateLabels[zone] || zone;
  }

  startEdit(): void {
    const g = this.garden();
    if (g) {
      this.editForm = {
        name: g.name,
        description: g.description || undefined,
        climate_zone: g.climate_zone,
        surface_m2: g.surface_m2 || undefined,
        hardiness_zone: g.hardiness_zone || undefined
      };
      this.isEditing.set(true);
      this.editMessage.set('');
    }
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.editMessage.set('');
  }

  saveEdit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.gardenService.updateGarden(id, this.editForm).subscribe({
        next: (response) => {
          if (response) {
            this.editMessage.set('Huerta actualizada correctamente');
            this.loadGarden(id);
            setTimeout(() => this.isEditing.set(false), 1500);
          }
        }
      });
    }
  }

  startInvite(): void {
    this.isInviting.set(true);
    this.inviteMessage.set('');
  }

  cancelInvite(): void {
    this.isInviting.set(false);
    this.inviteMessage.set('');
  }

  sendInvite(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.inviteEmail) {
      this.gardenService.inviteCollaborator(id, this.inviteEmail).subscribe({
        next: (response) => {
          if (response) {
            this.inviteMessage.set('Invitación enviada correctamente');
            this.inviteEmail = '';
            setTimeout(() => this.isInviting.set(false), 2000);
          }
        }
      });
    }
  }

  onDelete(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && confirm('¿Estás seguro de que quieres eliminar esta huerta?')) {
      this.gardenService.deleteGarden(id).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['/gardens']);
          }
        }
      });
    }
  }
}
