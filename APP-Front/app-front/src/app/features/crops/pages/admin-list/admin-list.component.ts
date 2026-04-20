import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CropService, Crop } from '../../services/crop.service';
import { AdminCropService } from '../../services/admin-crop.service';

@Component({
  selector: 'app-crop-admin-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-container">
      <div class="header">
        <h1>Administración de Cultivos</h1>
        <a routerLink="/admin/crops/create" class="btn-primary">
          + Nuevo Cultivo
        </a>
      </div>

      @if (cropService.loading()) {
        <div class="loading">Cargando...</div>
      }

      @if (cropService.error()) {
        <div class="error">{{ cropService.error() }}</div>
      }

      @if (adminService.success()) {
        <div class="success">{{ adminService.success() }}</div>
      }

      <table class="crop-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Nombre Científico</th>
            <th>Familia</th>
            <th>Categoría</th>
            <th>Días Cosecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (crop of crops(); track crop.id) {
            <tr>
              <td>{{ crop.name }}</td>
              <td><em>{{ crop.scientific_name }}</em></td>
              <td>{{ crop.family }}</td>
              <td>{{ getCategoryLabel(crop.category) }}</td>
              <td>{{ crop.days_to_harvest_min }} - {{ crop.days_to_harvest_max }}</td>
              <td class="actions">
                <a [routerLink]="['/admin/crops/edit', crop.id]" class="btn-edit">Editar</a>
                <button (click)="deleteCrop(crop)" class="btn-delete">Eliminar</button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="6" class="empty">No hay cultivos registrados</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .admin-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      color: var(--text-primary);
    }
    .btn-primary {
      background: var(--color-primary);
      color: var(--text-on-primary);
      padding: 10px 20px;
      text-decoration: none;
      border-radius: var(--radius-md);
      font-weight: var(--font-weight-medium);
    }
    .crop-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--card-bg);
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
    }
    .crop-table th, .crop-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
    .crop-table th {
      background: var(--bg-surface);
      font-weight: 600;
      color: var(--text-primary);
    }
    .crop-table td {
      color: var(--text-secondary);
    }
    .actions {
      display: flex;
      gap: 8px;
    }
    .btn-edit {
      background: var(--color-info);
      color: white;
      padding: 6px 12px;
      text-decoration: none;
      border-radius: var(--radius-sm);
      font-size: 12px;
    }
    .btn-delete {
      background: var(--color-error);
      color: white;
      padding: 6px 12px;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 12px;
    }
    .loading, .error, .success {
      padding: 12px;
      margin-bottom: 16px;
      border-radius: var(--radius-md);
    }
    .loading { background: var(--color-primary-light); color: var(--color-primary); }
    .error { background: rgba(198, 40, 40, 0.1); color: var(--color-error); border: 1px solid var(--color-error-light); }
    .success { background: var(--color-primary-light); color: var(--color-primary); }
    .empty { text-align: center; color: var(--text-muted); }
  `]
})
export class CropAdminListComponent implements OnInit {
  crops = signal<Crop[]>([]);
  
  categoryLabels: Record<string, string> = {
    'vegetable': 'Hortaliza',
    'fruit': 'Fruta',
    'herb': 'Hierba',
    'flower': 'Flor',
    'cereal': 'Cereal',
    'legume': 'Legumbre'
  };

  constructor(
    public cropService: CropService,
    public adminService: AdminCropService
  ) {}

  ngOnInit(): void {
    this.loadCrops();
  }

  loadCrops(): void {
    this.cropService.getCrops(1, 100).subscribe(response => {
      if (response) {
        this.crops.set(response.crops);
      }
    });
  }

  getCategoryLabel(category: string): string {
    return this.categoryLabels[category] || category;
  }

  deleteCrop(crop: Crop): void {
    if (confirm(`¿Estás seguro de que quieres eliminar "${crop.name}"?`)) {
      this.adminService.deleteCrop(crop.id).subscribe(result => {
        if (result) {
          this.loadCrops();
        }
      });
    }
  }
}
