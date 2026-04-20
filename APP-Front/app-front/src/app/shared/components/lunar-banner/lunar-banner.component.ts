import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LunarService, TodayLunarData, LunarRecommendation } from '../../../core/services/lunar.service';

@Component({
  selector: 'app-lunar-banner',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div class="lunar-banner loading">
        <span class="moon">🌙</span>
        <span class="text">Cargando fase lunar...</span>
      </div>
    } @else if (todayData()) {
      <div class="lunar-banner" [class]="getBannerClass()">
        <div class="lunar-header">
          <span class="moon-emoji">{{ todayData()!.moonPhaseEmoji }}</span>
          <span class="phase-label">{{ getPhaseLabel(todayData()!.moonPhase) }}</span>
          @if (todayData()!.illuminationPercent > 0) {
            <span class="illumination">{{ todayData()!.illuminationPercent }}%</span>
          }
        </div>
        
        @if (todayData()!.biodynamicDayType) {
          <div class="biodynamic-info">
            <span class="label">Día de:</span>
            <span class="type" [class]="todayData()!.biodynamicDayType">
              {{ getBiodynamicLabel(todayData()!.biodynamicDayType) }}
            </span>
          </div>
        }
        
        @if (recommendations().length > 0) {
          <div class="recommendations">
            <span class="rec-label">⭐ Ideal para:</span>
            @for (rec of recommendations().slice(0, 3); track rec.id) {
              <span class="rec-item" [class]="getRecClass(rec.recommendationType)">
                {{ getActionLabel(rec.agriculturalAction) }}
              </span>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .lunar-banner {
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
      border-radius: 12px;
      padding: 16px;
      color: white;
      margin-bottom: 16px;
    }
    .lunar-banner.loading {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--surface-card);
    }
    .lunar-banner.favorable {
      background: linear-gradient(135deg, #065f46 0%, #059669 100%);
    }
    .lunar-banner.new-moon, .lunar-banner.full-moon {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }
    .lunar-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }
    .moon-emoji {
      font-size: 28px;
    }
    .phase-label {
      font-size: 18px;
      font-weight: 600;
    }
    .illumination {
      margin-left: auto;
      font-size: 14px;
      opacity: 0.8;
    }
    .biodynamic-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .biodynamic-info .label {
      opacity: 0.8;
    }
    .biodynamic-info .type {
      padding: 2px 10px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 13px;
    }
    .type.root_day { background: #f97316; }
    .type.leaf_day { background: #22c55e; }
    .type.fruit_day { background: #eab308; color: #1f2937; }
    .type.flower_day { background: #ec4899; }
    
    .recommendations {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }
    .rec-label {
      opacity: 0.9;
    }
    .rec-item {
      padding: 4px 10px;
      border-radius: 12px;
      font-weight: 500;
    }
    .rec-item.highly_recommended { background: #22c55e; }
    .rec-item.recommended { background: #3b82f6; }
    .rec-item.not_recommended { background: #ef4444; }
  `]
})
export class LunarBannerComponent implements OnInit {
  private lunarService = inject(LunarService);
  
  todayData = signal<TodayLunarData | null>(null);
  recommendations = signal<LunarRecommendation[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadLunarData();
  }

  loadLunarData(): void {
    this.loading.set(true);
    
    this.lunarService.getTodayLunar().subscribe({
      next: (response) => {
        if (response.success) {
          this.todayData.set(response.data);
        }
      },
      error: () => {},
      complete: () => this.loading.set(false)
    });

    this.lunarService.getRecommendations('sowing').subscribe({
      next: (response) => {
        if (response.success) {
          this.recommendations.set(response.data);
        }
      }
    });
  }

  getBannerClass(): string {
    const data = this.todayData();
    if (!data) return '';
    if (data.isNewMoon || data.isFullMoon) return 'full-moon';
    if (data.biodynamicDayType === 'fruit_day' || data.biodynamicDayType === 'flower_day') return 'favorable';
    return '';
  }

  getPhaseLabel(phase: string): string {
    const labels: Record<string, string> = {
      'new_moon': 'Luna Nueva',
      'waxing_crescent': 'Luna Creciente',
      'first_quarter': 'Cuarto Creciente',
      'waxing_gibbous': 'Gibosa Creciente',
      'full_moon': 'Luna Llena',
      'waning_gibbous': 'Gibosa Menguante',
      'last_quarter': 'Cuarto Menguante',
      'waning_crescent': 'Luna Menguante'
    };
    return labels[phase] || phase;
  }

  getBiodynamicLabel(dayType: string): string {
    const labels: Record<string, string> = {
      'root_day': 'Raíz',
      'leaf_day': 'Hoja',
      'fruit_day': 'Fruto',
      'flower_day': 'Flor'
    };
    return labels[dayType] || dayType;
  }

  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      'sowing': 'Siembra',
      'harvesting': 'Cosecha',
      'transplanting': 'Trasplante',
      'pruning': 'Poda',
      'weeding': 'Desmalezar',
      'fertilizing': 'Fertilizar',
      'composting': 'Compostar'
    };
    return labels[action] || action;
  }

  getRecClass(type: string): string {
    if (type === 'highly_recommended') return 'highly_recommended';
    if (type === 'recommended') return 'recommended';
    return 'not_recommended';
  }
}