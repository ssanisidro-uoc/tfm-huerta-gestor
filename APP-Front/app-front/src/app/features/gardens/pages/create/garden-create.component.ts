import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GardenService, CreateGardenRequest } from '../../services/garden.service';
import { TranslationService } from '../../../../core/services/i18n/translation.service';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';

const CLIMATE_ZONES = [
  { value: 'mediterranean_coast', label: 'Costa Mediterránea' },
  { value: 'mediterranean_interior', label: 'Interior Mediterráneo' },
  { value: 'atlantic', label: 'Atlántico' },
  { value: 'continental', label: 'Continental' },
  { value: 'mountain', label: 'Montaña' },
  { value: 'subtropical', label: 'Subtropical' },
  { value: 'semiarid', label: 'Semiárido' },
  { value: 'canary_islands', label: 'Islas Canarias' }
];

const COUNTRIES = [
  { value: 'ES', label: 'España' },
  { value: 'PT', label: 'Portugal' },
  { value: 'FR', label: 'Francia' },
  { value: 'IT', label: 'Italia' },
  { value: 'MA', label: 'Marruecos' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CL', label: 'Chile' },
  { value: 'MX', label: 'México' },
  { value: 'CO', label: 'Colombia' },
  { value: 'PE', label: 'Perú' },
  { value: 'UY', label: 'Uruguay' }
];

@Component({
  selector: 'app-garden-create',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './garden-create.component.html',
  styleUrl: './garden-create.component.scss'
})
export class GardenCreateComponent {
  gardenService = inject(GardenService);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  name = '';
  description = '';
  climate_zone = '';
  surface_m2: number | null = null;
  location_city = '';
  location_region = '';
  location_address = '';
  location_country = '';

  showBasicFields = signal(false);
  showAdvancedFields = signal(false);

  climateZones = CLIMATE_ZONES;
  countries = COUNTRIES;

  onSubmit(): void {
    this.gardenService.clearError();
    
    if (!this.name || !this.climate_zone) {
      this.gardenService.setError(this.translationService.t('app.required'));
      return;
    }

    if (this.name.length < 2) {
      this.gardenService.setError(this.translationService.t('profile.nameMinLength'));
      return;
    }

    if (!this.location_city) {
      this.gardenService.setError('La ciudad es obligatoria para las recomendaciones climáticas');
      return;
    }

    if (this.surface_m2 !== null && this.surface_m2 <= 0) {
      this.gardenService.setError(this.translationService.t('gardens.invalidSurface'));
      return;
    }

    const data: CreateGardenRequest = {
      name: this.name,
      description: this.description || undefined,
      climate_zone: this.climate_zone,
      surface_m2: this.surface_m2 ?? undefined,
      location: {
        city: this.location_city,
        region: this.location_region || undefined,
        address: this.location_address || undefined,
        country: this.location_country || 'ES'
      }
    };

    this.gardenService.createGarden(data).subscribe({
      next: (response) => {
        if (response) {
          this.router.navigate(['/gardens']);
        }
      }
    });
  }
}
