import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlotService, CreatePlotRequest } from '../../services/plot.service';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';

const SOIL_TYPES = [
  { value: 'clay', label: 'Arcilloso' },
  { value: 'sandy', label: 'Arenoso' },
  { value: 'loamy', label: 'Franco' },
  { value: 'silty', label: 'Limoso' },
  { value: 'chalky', label: 'Calcáreo' },
  { value: 'humus_rich', label: 'Humífero' },
  { value: 'rocky', label: 'Pedregoso' },
  { value: 'mixed', label: 'Mixto' },
  { value: 'unknown', label: 'Desconocido' }
];

const IRRIGATION_TYPES = [
  { value: 'manual', label: 'Manual' },
  { value: 'drip', label: 'Goteo' },
  { value: 'sprinkler', label: 'Aspersión' },
  { value: 'flood', label: 'Inundación' },
  { value: 'subsurface', label: 'Subterráneo' },
  { value: 'automatic', label: 'Automático' },
  { value: 'rainfed', label: 'Secano (solo lluvia)' }
];

@Component({
  selector: 'app-plot-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plot-create.component.html',
  styleUrl: './plot-create.component.scss'
})
export class PlotCreateComponent {
  gardenId = '';
  name = '';
  code = '';
  surface_m2: number | null = null;
  length_m: number | null = null;
  width_m: number | null = null;
  description = '';
  soil_type = '';
  soil_ph: number | null = null;
  irrigation_type = 'manual';
  has_water_access = true;
  has_greenhouse = false;
  has_raised_bed = false;
  has_mulch = false;

  soilTypes = SOIL_TYPES;
  irrigationTypes = IRRIGATION_TYPES;

  constructor(
    private route: ActivatedRoute,
    public plotService: PlotService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.gardenId = this.route.snapshot.paramMap.get('gardenId') || '';
  }

  onSubmit(): void {
    this.plotService.clearError();
    
    if (!this.name) {
      this.plotService.setError('El nombre de la parcela es obligatorio');
      return;
    }

    if (!this.surface_m2 || this.surface_m2 <= 0) {
      this.plotService.setError('La superficie debe ser un número positivo');
      return;
    }

    if (!this.gardenId) {
      this.plotService.setError('No se ha especificado la huerta');
      return;
    }

    const data: CreatePlotRequest = {
      name: this.name,
      code: this.code || undefined,
      surface_m2: this.surface_m2,
      description: this.description || undefined,
      length_m: this.length_m ?? undefined,
      width_m: this.width_m ?? undefined,
      soil_type: this.soil_type || undefined,
      soil_ph: this.soil_ph ?? undefined,
      irrigation_type: this.irrigation_type,
      has_water_access: this.has_water_access,
      has_greenhouse: this.has_greenhouse,
      has_raised_bed: this.has_raised_bed,
      has_mulch: this.has_mulch
    };

    this.plotService.createPlot(this.gardenId, data).subscribe({
      next: (response) => {
        if (response) {
          this.router.navigate(['/gardens', this.gardenId]);
        }
      }
    });
  }
}
