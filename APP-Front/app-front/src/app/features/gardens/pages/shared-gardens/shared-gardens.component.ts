import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GardenService, SharedGarden } from '../../services/garden.service';

@Component({
  selector: 'app-shared-gardens',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shared-gardens.component.html',
  styleUrl: './shared-gardens.component.scss'
})
export class SharedGardensComponent implements OnInit {
  gardenService = inject(GardenService);
  sharedGardens = this.gardenService.sharedGardens;
  processingId = signal<string | null>(null);

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
    this.gardenService.getSharedGardens().subscribe();
  }

  getClimateLabel(zone: string): string {
    return this.climateLabels[zone] || zone;
  }

  getRoleLabel(role: string): string {
    return this.roleLabels[role] || role;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  acceptInvitation(gardenId: string): void {
    this.processingId.set(gardenId);
    this.gardenService.acceptInvitation(gardenId).subscribe({
      next: (response) => {
        this.processingId.set(null);
        if (response?.success) {
          this.gardenService.getSharedGardens().subscribe();
        }
      },
      error: () => {
        this.processingId.set(null);
      }
    });
  }

  rejectInvitation(gardenId: string): void {
    if (confirm('¿Estás seguro de que quieres rechazar esta invitación?')) {
      this.processingId.set(gardenId);
      this.gardenService.rejectInvitation(gardenId).subscribe({
        next: (response) => {
          this.processingId.set(null);
          if (response?.success) {
            this.gardenService.getSharedGardens().subscribe();
          }
        },
        error: () => {
          this.processingId.set(null);
        }
      });
    }
  }
}
