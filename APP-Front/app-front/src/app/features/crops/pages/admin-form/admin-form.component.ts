import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CropService, CropDetail } from '../../services/crop.service';
import { AdminCropService, CreateCropDto } from '../../services/admin-crop.service';

@Component({
  selector: 'app-crop-admin-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-container">
      <div class="header">
        <h1>{{ isEditMode() ? 'Editar' : 'Nuevo' }} Cultivo</h1>
        <a routerLink="/admin/crops" class="btn-back">Volver</a>
      </div>

      @if (adminService.error()) {
        <div class="error">{{ adminService.error() }}</div>
      }

      @if (adminService.success()) {
        <div class="success">{{ adminService.success() }}</div>
      }

      <form (ngSubmit)="onSubmit()" class="crop-form">
        <fieldset>
          <legend>Información Básica</legend>
          
          <div class="form-group">
            <label for="name">Nombre *</label>
            <input type="text" id="name" [(ngModel)]="crop.name" name="name" required>
          </div>

          <div class="form-group">
            <label for="scientific_name">Nombre Científico</label>
            <input type="text" id="scientific_name" [(ngModel)]="crop.scientific_name" name="scientific_name">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="family">Familia</label>
              <input type="text" id="family" [(ngModel)]="crop.family" name="family">
            </div>

            <div class="form-group">
              <label for="category">Categoría *</label>
              <select id="category" [(ngModel)]="crop.category" name="category" required>
                <option value="">Seleccionar...</option>
                <option value="vegetable">Hortaliza</option>
                <option value="fruit">Fruta</option>
                <option value="herb">Hierba</option>
                <option value="flower">Flor</option>
                <option value="cereal">Cereal</option>
                <option value="legume">Legumbre</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="lifecycle">Ciclo de Vida</label>
              <select id="lifecycle" [(ngModel)]="crop.lifecycle" name="lifecycle">
                <option value="">Seleccionar...</option>
                <option value="annual">Anual</option>
                <option value="biennial">Bienal</option>
                <option value="perennial">Perenne</option>
              </select>
            </div>

            <div class="form-group">
              <label for="growth_habit">Hábito de Crecimiento</label>
              <select id="growth_habit" [(ngModel)]="crop.growth_habit" name="growth_habit">
                <option value="">Seleccionar...</option>
                <option value="erect">Erecto</option>
                <option value="spreading">Extendido</option>
                <option value="climbing">Trepador</option>
                <option value="bush">Arbustivo</option>
                <option value="ground_cover">Cubresuelo</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Ciclo de Cultivo</legend>
          
          <div class="form-row">
            <div class="form-group">
              <label for="days_to_harvest_min">Días hasta Cosecha (mín)</label>
              <input type="number" id="days_to_harvest_min" [(ngModel)]="crop.days_to_harvest_min" name="days_to_harvest_min">
            </div>

            <div class="form-group">
              <label for="days_to_harvest_max">Días hasta Cosecha (máx)</label>
              <input type="number" id="days_to_harvest_max" [(ngModel)]="crop.days_to_harvest_max" name="days_to_harvest_max">
            </div>

            <div class="form-group">
              <label for="days_to_germination">Días hasta Germinación</label>
              <input type="number" id="days_to_germination" [(ngModel)]="crop.days_to_germination" name="days_to_germination">
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Requisitos de Clima</legend>
          
          <div class="form-row">
            <div class="form-group">
              <label for="min_temperature_c">Temperatura Mínima (°C)</label>
              <input type="number" id="min_temperature_c" [(ngModel)]="crop.min_temperature_c" name="min_temperature_c">
            </div>

            <div class="form-group">
              <label for="max_temperature_c">Temperatura Máxima (°C)</label>
              <input type="number" id="max_temperature_c" [(ngModel)]="crop.max_temperature_c" name="max_temperature_c">
            </div>

            <div class="form-group">
              <label for="optimal_temperature_min_c">Temperatura Óptima (mín)</label>
              <input type="number" id="optimal_temperature_min_c" [(ngModel)]="crop.optimal_temperature_min_c" name="optimal_temperature_min_c">
            </div>

            <div class="form-group">
              <label for="optimal_temperature_max_c">Temperatura Óptima (máx)</label>
              <input type="number" id="optimal_temperature_max_c" [(ngModel)]="crop.optimal_temperature_max_c" name="optimal_temperature_max_c">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="crop.frost_tolerant" name="frost_tolerant">
                Resistente a Heladas
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="crop.heat_tolerant" name="heat_tolerant">
                Resistente al Calor
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="sun_requirement">Requerimiento de Sol</label>
            <select id="sun_requirement" [(ngModel)]="crop.sun_requirement" name="sun_requirement">
              <option value="">Seleccionar...</option>
              <option value="full_sun">Pleno Sol (6+ horas)</option>
              <option value="partial_sun">Sol Parcial (3-6 horas)</option>
              <option value="shade">Sombra (< 3 horas)</option>
            </select>
          </div>
        </fieldset>

        <fieldset>
          <legend>Requisitos de Suelo</legend>
          
          <div class="form-row">
            <div class="form-group">
              <label for="min_soil_ph">pH Mínimo del Suelo</label>
              <input type="number" step="0.1" id="min_soil_ph" [(ngModel)]="crop.min_soil_ph" name="min_soil_ph">
            </div>

            <div class="form-group">
              <label for="max_soil_ph">pH Máximo del Suelo</label>
              <input type="number" step="0.1" id="max_soil_ph" [(ngModel)]="crop.max_soil_ph" name="max_soil_ph">
            </div>

            <div class="form-group">
              <label for="soil_depth_requirement">Profundidad del Suelo</label>
              <select id="soil_depth_requirement" [(ngModel)]="crop.soil_depth_requirement" name="soil_depth_requirement">
                <option value="">Seleccionar...</option>
                <option value="shallow">Poco profundo (< 30cm)</option>
                <option value="medium">Medio (30-60cm)</option>
                <option value="deep">Profundo (> 60cm)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="soil_fertility_requirement">Requerimiento de Fertilidad</label>
            <select id="soil_fertility_requirement" [(ngModel)]="crop.soil_fertility_requirement" name="soil_fertility_requirement">
              <option value="">Seleccionar...</option>
              <option value="low">Bajo</option>
              <option value="medium">Medio</option>
              <option value="high">Alto</option>
            </select>
          </div>
        </fieldset>

        <fieldset>
          <legend>Requisitos de Agua</legend>
          
          <div class="form-group">
            <label for="water_requirement">Requerimiento de Agua</label>
            <select id="water_requirement" [(ngModel)]="crop.water_requirement" name="water_requirement">
              <option value="">Seleccionar...</option>
              <option value="low">Bajo</option>
              <option value="medium">Medio</option>
              <option value="high">Alto</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="crop.drought_tolerant" name="drought_tolerant">
                Resistente a Sequía
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="crop.waterlogging_tolerant" name="waterlogging_tolerant">
                Resistente a Encharcamiento
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Siembra y Espaciado</legend>
          
          <div class="form-row">
            <div class="form-group">
              <label for="recommended_spacing_cm">Espaciado Recomendado (cm)</label>
              <input type="number" id="recommended_spacing_cm" [(ngModel)]="crop.recommended_spacing_cm" name="recommended_spacing_cm">
            </div>

            <div class="form-group">
              <label for="recommended_row_spacing_cm">Espaciado entre Filas (cm)</label>
              <input type="number" id="recommended_row_spacing_cm" [(ngModel)]="crop.recommended_row_spacing_cm" name="recommended_row_spacing_cm">
            </div>

            <div class="form-group">
              <label for="seed_depth_cm">Profundidad de Siembra (cm)</label>
              <input type="number" step="0.5" id="seed_depth_cm" [(ngModel)]="crop.seed_depth_cm" name="seed_depth_cm">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="sowing_start_month">Mes Inicio Siembra</label>
              <select id="sowing_start_month" [(ngModel)]="crop.sowing_start_month" name="sowing_start_month">
                <option [value]="null">Seleccionar...</option>
                @for (month of months; track month.value) {
                  <option [value]="month.value">{{ month.label }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label for="sowing_end_month">Mes Fin Siembra</label>
              <select id="sowing_end_month" [(ngModel)]="crop.sowing_end_month" name="sowing_end_month">
                <option [value]="null">Seleccionar...</option>
                @for (month of months; track month.value) {
                  <option [value]="month.value">{{ month.label }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label for="harvest_start_month">Mes Inicio Cosecha</label>
              <select id="harvest_start_month" [(ngModel)]="crop.harvest_start_month" name="harvest_start_month">
                <option [value]="null">Seleccionar...</option>
                @for (month of months; track month.value) {
                  <option [value]="month.value">{{ month.label }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label for="harvest_end_month">Mes Fin Cosecha</label>
              <select id="harvest_end_month" [(ngModel)]="crop.harvest_end_month" name="harvest_end_month">
                <option [value]="null">Seleccionar...</option>
                @for (month of months; track month.value) {
                  <option [value]="month.value">{{ month.label }}</option>
                }
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Rotación de Cultivos</legend>
          
          <div class="form-row">
            <div class="form-group">
              <label for="rotation_group">Grupo de Rotación</label>
              <input type="text" id="rotation_group" [(ngModel)]="crop.rotation_group" name="rotation_group" placeholder="ej: hoja, fruto, raíz, leguminosa">
            </div>

            <div class="form-group">
              <label for="years_before_replant">Años antes de Replantar</label>
              <input type="number" id="years_before_replant" [(ngModel)]="crop.years_before_replant" name="years_before_replant">
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Información Adicional</legend>
          
          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea id="description" [(ngModel)]="crop.description" name="description" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label for="growing_tips">Consejos de Cultivo</label>
            <textarea id="growing_tips" [(ngModel)]="crop.growing_tips" name="growing_tips" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label for="culinary_uses">Usos Culinarios</label>
            <textarea id="culinary_uses" [(ngModel)]="crop.culinary_uses" name="culinary_uses" rows="2"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="crop.nitrogen_fixer" name="nitrogen_fixer">
                Fijador de Nitrógeno
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="crop.attracts_pollinators" name="attracts_pollinators">
                Atrae Polinizadores
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="crop.attracts_beneficial_insects" name="attracts_beneficial_insects">
                Atrae Insectos Beneficiosos
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="harvest_type">Tipo de Cosecha</label>
            <select id="harvest_type" [(ngModel)]="crop.harvest_type" name="harvest_type">
              <option value="">Seleccionar...</option>
              <option value="once">Cosecha única</option>
              <option value="multiple">Cosecha múltiple</option>
              <option value="continuous">Cosecha continua</option>
            </select>
          </div>
        </fieldset>

        <div class="form-actions">
          <button type="button" routerLink="/admin/crops" class="btn-cancel">Cancelar</button>
          <button type="submit" [disabled]="adminService.loading()" class="btn-submit">
            {{ adminService.loading() ? 'Guardando...' : (isEditMode() ? 'Actualizar' : 'Crear') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .admin-container {
      padding: 20px;
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .header h1 { margin: 0; font-size: 24px; color: var(--text-primary); }
    .btn-back {
      background: var(--text-muted);
      color: var(--text-on-primary);
      padding: 8px 16px;
      text-decoration: none;
      border-radius: var(--radius-md);
    }
    .crop-form {
      background: var(--card-bg);
      padding: 20px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
    }
    fieldset {
      border: 1px solid var(--border-color);
      padding: 15px;
      margin-bottom: 15px;
      border-radius: var(--radius-md);
    }
    legend {
      font-weight: 600;
      color: var(--text-primary);
      padding: 0 10px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .form-row {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }
    .form-row .form-group {
      flex: 1;
      min-width: 150px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: var(--text-primary);
    }
    input[type="text"],
    input[type="number"],
    select,
    textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      font-size: 14px;
      background: var(--bg-secondary);
      color: var(--text-primary);
    }
    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 5px;
      font-weight: normal;
    }
    .checkbox-group input[type="checkbox"] {
      width: auto;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .btn-cancel, .btn-submit {
      padding: 10px 20px;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: 14px;
    }
    .btn-cancel {
      background: var(--text-muted);
      color: var(--text-on-primary);
      border: none;
    }
    .btn-submit {
      background: var(--color-primary);
      color: var(--text-on-primary);
      border: none;
    }
    .btn-submit:disabled {
      background: var(--color-primary-light);
      cursor: not-allowed;
    }
    .error, .success {
      padding: 12px;
      margin-bottom: 16px;
      border-radius: var(--radius-md);
    }
    .error { background: rgba(198, 40, 40, 0.1); color: var(--color-error); border: 1px solid var(--color-error-light); }
    .success { background: var(--color-primary-light); color: var(--color-primary); }
  `]
})
export class CropAdminFormComponent implements OnInit {
  crop: CreateCropDto = this.getEmptyCrop();
  isEditMode = signal(false);
  cropId = signal<string | null>(null);

  months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cropService: CropService,
    public adminService: AdminCropService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.cropId.set(id);
      this.loadCrop(id);
    }
  }

  getEmptyCrop(): CreateCropDto {
    return {
      name: '',
      scientific_name: '',
      family: '',
      category: 'vegetable'
    };
  }

  loadCrop(id: string): void {
    this.cropService.getCropById(id).subscribe(crop => {
      if (crop) {
        this.crop = {
          name: crop.name,
          scientific_name: crop.scientific_name,
          family: crop.family,
          category: crop.category,
          lifecycle: crop.lifecycle,
          growth_habit: crop.growth_habit,
          days_to_harvest_min: crop.days_to_harvest_min,
          days_to_harvest_max: crop.days_to_harvest_max,
          days_to_germination: crop.days_to_germination,
          min_temperature_c: crop.min_temperature_c,
          max_temperature_c: crop.max_temperature_c,
          optimal_temperature_min_c: crop.optimal_temperature_min_c,
          optimal_temperature_max_c: crop.optimal_temperature_max_c,
          frost_tolerant: crop.frost_tolerant,
          heat_tolerant: crop.heat_tolerant,
          sun_requirement: crop.sun_requirement,
          min_sun_hours: crop.min_sun_hours,
          shade_tolerance: crop.shade_tolerance,
          preferred_soil_types: crop.preferred_soil_types,
          min_soil_ph: crop.min_soil_ph,
          max_soil_ph: crop.max_soil_ph,
          soil_depth_requirement: crop.soil_depth_requirement,
          soil_fertility_requirement: crop.soil_fertility_requirement,
          water_requirement: crop.water_requirement,
          drought_tolerant: crop.drought_tolerant,
          waterlogging_tolerant: crop.waterlogging_tolerant,
          recommended_spacing_cm: crop.recommended_spacing_cm,
          recommended_row_spacing_cm: crop.recommended_row_spacing_cm,
          seed_depth_cm: crop.seed_depth_cm,
          sowing_start_month: crop.sowing_start_month,
          sowing_end_month: crop.sowing_end_month,
          harvest_start_month: crop.harvest_start_month,
          harvest_end_month: crop.harvest_end_month,
          rotation_group: crop.rotation_group,
          years_before_replant: crop.years_before_replant,
          nitrogen_fixer: crop.nitrogen_fixer,
          attracts_pollinators: crop.attracts_pollinators,
          attracts_beneficial_insects: crop.attracts_beneficial_insects,
          harvest_type: crop.harvest_type,
          description: crop.description,
          growing_tips: crop.growing_tips,
          culinary_uses: crop.culinary_uses
        };
      }
    });
  }

  onSubmit(): void {
    if (!this.crop.name || !this.crop.category) {
      this.adminService.setError('El nombre y la categoría son obligatorios');
      return;
    }

    const operation = this.isEditMode() && this.cropId()
      ? this.adminService.updateCrop(this.cropId()!, this.crop)
      : this.adminService.createCrop(this.crop);

    operation.subscribe(result => {
      if (result) {
        setTimeout(() => {
          this.router.navigate(['/admin/crops']);
        }, 1500);
      }
    });
  }
}
