import { Component, signal, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GardenService, UpdateGardenRequest, LocationValidation } from '../../services/garden.service';
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
  selector: 'app-garden-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './garden-edit.component.html',
  styleUrl: './garden-edit.component.scss'
})
export class GardenEditComponent implements OnInit {
  gardenService = inject(GardenService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translationService = inject(TranslationService);

  gardenId = '';
  name = '';
  description = '';
  climate_zone = '';
  surface_m2: number | null = null;
  location_city = '';
  location_region = '';
  location_address = '';
  location_country = '';
  location_latitude: number | null = null;
  location_longitude: number | null = null;

  showBasicFields = signal(false);
  locationValid = signal<LocationValidation | null>(null);
  locationValidating = signal(false);
  locationError = signal<string | null>(null);

  climateZones = CLIMATE_ZONES;
  countries = COUNTRIES;

  ngOnInit(): void {
    this.gardenId = this.route.snapshot.paramMap.get('id') || '';
    this.loadGarden();
  }

  private loadGarden(): void {
    this.gardenService.getGardenById(this.gardenId).subscribe({
      next: (g) => {
        if (g) {
          this.name = g.name;
          this.description = g.description || '';
          this.climate_zone = g.climate_zone;
          this.surface_m2 = g.surface_m2 ?? null;
          if (g.location) {
            this.location_city = g.location.city || '';
            this.location_region = g.location.region || '';
            this.location_address = g.location.address || '';
            this.location_country = g.location.country || 'ES';
            this.location_latitude = g.location.latitude ?? null;
            this.location_longitude = g.location.longitude ?? null;
          }
        }
      }
    });
  }

  async onCityChange(): Promise<void> {
    if (!this.location_city || this.location_city.length < 3) {
      this.locationValid.set(null);
      this.locationError.set(null);
      return;
    }

    this.locationValidating.set(true);
    this.locationError.set(null);

    this.gardenService.validateLocation(
      this.location_city,
      this.location_region || undefined,
      this.location_country || 'ES'
    ).subscribe({
      next: (result) => {
        this.locationValidating.set(false);
        if (result?.valid) {
          this.locationValid.set(result);
          this.location_latitude = result.location?.latitude ?? null;
          this.location_longitude = result.location?.longitude ?? null;
          this.locationError.set(null);
        } else {
          this.locationValid.set(null);
          this.locationError.set(result?.error || 'Ciudad no encontrada');
        }
      },
      error: () => {
        this.locationValidating.set(false);
        this.locationError.set('Error al validar');
      }
    });
  }

  onSubmit(): void {
    this.gardenService.clearError();

    if (!this.name || !this.climate_zone) {
      this.gardenService.setError(this.translationService.t('app.required'));
      return;
    }

    if (!this.location_city) {
      this.gardenService.setError('La ciudad es obligatoria');
      return;
    }

    if (this.locationError()) {
      this.gardenService.setError('Por favor, introduce una ciudad válida');
      return;
    }

    const data: UpdateGardenRequest = {
      name: this.name,
      description: this.description || null,
      climate_zone: this.climate_zone,
      surface_m2: this.surface_m2 ?? null,
      location: {
        city: this.location_city,
        region: this.location_region || undefined,
        address: this.location_address || undefined,
        country: this.location_country || 'ES',
        latitude: this.location_latitude ?? undefined,
        longitude: this.location_longitude ?? undefined
      }
    };

    this.gardenService.updateGarden(this.gardenId, data).subscribe({
      next: (response) => {
        if (response) {
          this.router.navigate(['/gardens', this.gardenId]);
        }
      }
    });
  }
}