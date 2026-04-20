import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CropService, CropDetail } from '../../services/crop.service';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';
import { TranslationService } from '../../../../core/services/i18n/translation.service';

@Component({
  selector: 'app-crop-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './crop-detail.component.html',
  styleUrl: './crop-detail.component.scss'
})
export class CropDetailComponent implements OnInit {
  private translationService = inject(TranslationService);
  crop = signal<CropDetail | null>(null);
  deleting = signal(false);

  private categoryLabels: Record<string, string> = {
    'vegetable_leaf': 'vegetable_leaf',
    'vegetable_root': 'vegetable_root',
    'vegetable_fruit': 'vegetable_fruit',
    'vegetable_flower': 'vegetable_flower',
    'vegetable_legume': 'vegetable_legume',
    'vegetable_allium': 'vegetable_allium',
    'vegetable_cucurbit': 'vegetable_cucurbit',
    'vegetable_brassica': 'vegetable_brassica',
    'herb': 'herb',
    'aromatic': 'aromatic',
    'fruit': 'fruit'
  };

  private lifecycleLabels: Record<string, string> = {
    'annual': 'annual',
    'biennial': 'biennial',
    'perennial': 'perennial'
  };

  private growthHabitLabels: Record<string, string> = {
    'rosette': 'rosette',
    'erect': 'erect',
    'spreading': 'spreading',
    'climbing': 'climbing',
    'bush': 'bush',
    'trailing': 'trailing'
  };

  private sunExposureLabels: Record<string, string> = {
    'full_sun': 'full_sun',
    'partial_sun': 'partial_sun',
    'partial_shade': 'partial_shade',
    'full_shade': 'full_shade'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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

  getCategoryLabel(value: string | null): string {
    if (!value) return this.translationService.t('crops.na');
    const key = `crops.categoryLabels.${this.categoryLabels[value] || value}`;
    const translated = this.translationService.t(key);
    return translated !== key ? translated : value;
  }

  getLifecycleLabel(value: string | null): string {
    if (!value) return this.translationService.t('crops.na');
    const key = `crops.lifecycleLabels.${this.lifecycleLabels[value] || value}`;
    const translated = this.translationService.t(key);
    return translated !== key ? translated : value;
  }

  getGrowthHabitLabel(value: string | null): string {
    if (!value) return this.translationService.t('crops.na');
    const key = `crops.growthHabitLabels.${this.growthHabitLabels[value] || value}`;
    const translated = this.translationService.t(key);
    return translated !== key ? translated : value;
  }

  getSunExposureLabel(value: string | null): string {
    if (!value) return this.translationService.t('crops.na');
    const key = `crops.sunExposureLabels.${this.sunExposureLabels[value] || value}`;
    const translated = this.translationService.t(key);
    return translated !== key ? translated : value;
  }

  getSoilTypesLabel(values: string[] | null): string {
    if (!values || values.length === 0) return this.translationService.t('crops.na');
    return values.map(v => {
      const translated = this.translationService.t(`crops.soilTypes.${v}`);
      return translated !== `crops.soilTypes.${v}` ? translated : v;
    }).join(', ');
  }

  getSoilDepthLabel(value: string | null): string {
    if (!value) return this.translationService.t('crops.na');
    const translated = this.translationService.t(`crops.soilDepth.${value}`);
    return translated !== `crops.soilDepth.${value}` ? translated : value;
  }

  getSoilFertilityLabel(value: string | null): string {
    if (!value) return this.translationService.t('crops.na');
    const translated = this.translationService.t(`crops.soilFertility.${value}`);
    return translated !== `crops.soilFertility.${value}` ? translated : value;
  }

  getWaterRequirementLabel(value: string | null): string {
    if (!value) return this.translationService.t('crops.na');
    const translated = this.translationService.t(`crops.waterRequirement.${value}`);
    return translated !== `crops.waterRequirement.${value}` ? translated : value;
  }

  deleteCrop(): void {
    const crop = this.crop();
    if (!crop) return;

    if (confirm(`¿Estás seguro de que quieres eliminar "${crop.name}"? Esta acción no se puede deshacer.`)) {
      this.deleting.set(true);
      this.cropService.deleteCrop(crop.id).subscribe({
        next: (result) => {
          this.deleting.set(false);
          if (result?.success) {
            this.router.navigate(['/crops']);
          }
        },
        error: () => {
          this.deleting.set(false);
        }
      });
    }
  }
}
