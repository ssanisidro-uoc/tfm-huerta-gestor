import { Component, signal, inject, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { GardenService, CreateGardenRequest, LocationValidation, CitySuggestion } from '../../services/garden.service';
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
export class GardenCreateComponent implements OnDestroy {
  gardenService = inject(GardenService);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  name = '';
  description = '';
  climate_zone = '';
  surface_m2: number | null = null;
  location_city = '';
  location_region = '';
  location_address = '';
  location_country = '';

  locationValid = signal<LocationValidation | null>(null);
  locationValidating = signal(false);
  locationError = signal<string | null>(null);
  citySuggestions = signal<CitySuggestion[]>([]);
  showSuggestions = signal(false);

  location_latitude: number | null = null;
  location_longitude: number | null = null;

  showBasicFields = signal(false);
  showAdvancedFields = signal(false);

  climateZones = CLIMATE_ZONES;
  countries = COUNTRIES;

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => this.searchCities(query));
  }

  onCityInput(): void {
    this.locationValid.set(null);
    this.locationError.set(null);
    this.showSuggestions.set(true);
    
    if (this.location_city.length >= 2) {
      this.searchSubject.next(this.location_city);
    } else {
      this.citySuggestions.set([]);
    }
  }

  private searchCities(query: string): void {
    if (!query || query.length < 2) {
      this.citySuggestions.set([]);
      return;
    }

    this.gardenService.searchCities(query, this.location_country || undefined).subscribe({
      next: (suggestions) => {
        this.citySuggestions.set(suggestions);
      },
      error: () => {
        this.citySuggestions.set([]);
      }
    });
  }

  selectCity(suggestion: CitySuggestion): void {
    this.location_city = suggestion.city;
    this.location_region = suggestion.region || '';
    this.location_country = suggestion.country;
    this.location_latitude = suggestion.latitude;
    this.location_longitude = suggestion.longitude;
    this.locationValid.set({
      valid: true,
      location: {
        city: suggestion.city,
        region: suggestion.region,
        country: suggestion.country,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        displayName: suggestion.displayName
      }
    });
    this.citySuggestions.set([]);
    this.showSuggestions.set(false);
    this.locationError.set(null);
  }

  onLocationBlur(): void {
    setTimeout(() => {
      this.showSuggestions.set(false);
    }, 200);
    
    if (!this.location_city || this.location_city.length < 3) {
      this.locationValid.set(null);
      this.locationError.set(null);
      return;
    }

    if (this.locationValid()) {
      return;
    }

    this.locationValidating.set(true);
    this.locationError.set(null);

    this.gardenService.validateLocation(
      this.location_city,
      this.location_region || undefined,
      this.location_country || undefined
    ).subscribe({
      next: (result) => {
        this.locationValidating.set(false);
        if (result?.valid) {
          this.locationValid.set(result);
          this.location_latitude = result.location?.latitude ?? null;
          this.location_longitude = result.location?.longitude ?? null;
          this.location_city = result.location?.city || this.location_city;
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

    if (this.locationError()) {
      this.gardenService.setError('Ciudad no válida. Por favor, introduce una ciudad válida.');
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
        city: this.locationValid()?.location?.city || this.location_city,
        region: this.locationValid()?.location?.region || this.location_region || undefined,
        address: this.location_address || undefined,
        country: this.locationValid()?.location?.country || this.location_country || 'ES',
        latitude: this.location_latitude ?? undefined,
        longitude: this.location_longitude ?? undefined
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
