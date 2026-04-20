import { Component, inject, signal, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LunarService, TodayLunarData } from '../../../core/services/lunar.service';
import { TranslationService } from '../../../core/services/i18n/translation.service';
import { TranslatePipe } from '../../../core/services/i18n/translate.pipe';


@Component({
  selector: 'app-lunar-indicator',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lunar-container" (click)="$event.stopPropagation()">
      <div class="lunar-indicator" 
           [class.loading]="loading()" 
           [class.new-moon]="data()?.isNewMoon" 
           [class.full-moon]="data()?.isFullMoon"
           (click)="toggleTooltip()">
        @if (loading()) {
          <span class="loading-icon">🌙</span>
        } @else if (data()) {
          <span class="moon-emoji">{{ data()!.moonPhaseEmoji }}</span>
          <span class="moon-phase">{{ getPhaseLabel(data()!.moonPhase) }}</span>
          @if (data()!.biodynamicDayType) {
            <span class="biodynamic-day" [class]="data()!.biodynamicDayType">
              {{ getBiodynamicLabel(data()!.biodynamicDayType) }}
            </span>
          }
        } @else {
          <span class="moon-emoji">🌙</span>
          <span class="moon-phase">Lunar</span>
        }
        <svg class="info-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      
      @if (showTooltip()) {
        <div class="lunar-tooltip" (click)="$event.stopPropagation()">
          @if (data()) {
            <div class="tooltip-header">
              <span class="tooltip-emoji">{{ data()!.moonPhaseEmoji }}</span>
              <span class="tooltip-title">{{ getPhaseLabel(data()!.moonPhase) }}</span>
            </div>
            
            <div class="tooltip-section">
              <span class="tooltip-label">Iluminación</span>
              <span class="tooltip-value">{{ data()!.illuminationPercent }}%</span>
            </div>
            
            @if (data()!.zodiacSign) {
              <div class="tooltip-section">
                <span class="tooltip-label">Zodiaco</span>
                <span class="tooltip-value zodiac" [class]="data()!.zodiacElement">
                  {{ getZodiacLabel(data()!.zodiacSign) }} ({{ data()!.zodiacElement }})
                </span>
              </div>
            }
            
            @if (data()!.biodynamicDayType) {
              <div class="tooltip-section">
                <span class="tooltip-label">Día Biodinámico</span>
                <span class="tooltip-value">
                  {{ getBiodynamicLabel(data()!.biodynamicDayType) }} ({{ data()!.biodynamicQuality }})
                </span>
              </div>
            }
            
            <div class="tooltip-section special">
              @if (data()!.isNewMoon) {
                <span class="special-text">🌑 {{ getPhaseLabel(data()!.moonPhase) }} - {{ 'lunar.idealPlanting' | t }}</span>
              } @else if (data()!.isFullMoon) {
                <span class="special-text">🌕 {{ getPhaseLabel(data()!.moonPhase) }} - {{ 'lunar.idealHarvesting' | t }}</span>
              } @else if (data()!.isFirstQuarter) {
                <span class="special-text">🌓 {{ getPhaseLabel(data()!.moonPhase) }} - {{ 'lunar.idealTransplanting' | t }}</span>
              } @else if (data()!.isLastQuarter) {
                <span class="special-text">🌗 {{ getPhaseLabel(data()!.moonPhase) }} - {{ 'lunar.idealPruning' | t }}</span>
              } @else {
                <span class="special-text">Fase: {{ getPhaseLabel(data()!.moonPhase) }}</span>
              }
            </div>
            
            <div class="tooltip-footer">
              <span class="tooltip-date">{{ formatDate(data()!.date) }}</span>
            </div>
          } @else if (error()) {
            <div class="tooltip-error">
              <span>Error al cargar datos lunares</span>
              <button (click)="loadLunarData()">Reintentar</button>
            </div>
          } @else {
            <div class="tooltip-loading">Cargando...</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .lunar-container {
      position: relative;
      display: inline-block;
    }
    .lunar-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: var(--card-bg);
      border-radius: 20px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .lunar-indicator:hover {
      background: var(--bg-hover);
    }
    .lunar-indicator.new-moon {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #e0e0e0;
    }
    .lunar-indicator.full-moon {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      color: #92400e;
    }
    .moon-emoji {
      font-size: 16px;
    }
    .moon-phase {
      font-weight: 500;
    }
    .biodynamic-day {
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .biodynamic-day.root_day { background: #f97316; color: white; }
    .biodynamic-day.leaf_day { background: #22c55e; color: white; }
    .biodynamic-day.fruit_day { background: #eab308; color: #1f2937; }
    .biodynamic-day.flower_day { background: #ec4899; color: white; }
    .loading-icon {
      animation: spin 2s linear infinite;
    }
    .info-icon {
      opacity: 0.5;
      margin-left: 4px;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    /* Tooltip */
    .lunar-tooltip {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 8px;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 16px;
      min-width: 280px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      z-index: 9999;
    }
    .tooltip-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border-color);
    }
    .tooltip-emoji {
      font-size: 32px;
    }
    .tooltip-title {
      font-size: 18px;
      font-weight: 600;
    }
    .tooltip-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .tooltip-label {
      font-size: 12px;
      color: var(--text-muted);
    }
    .tooltip-value {
      font-size: 13px;
      font-weight: 500;
    }
    .tooltip-value.zodiac.fire { color: #f97316; }
    .tooltip-value.zodiac.water { color: #3b82f6; }
    .tooltip-value.zodiac.earth { color: #22c55e; }
    .tooltip-value.zodiac.air { color: #a855f7; }
    .tooltip-section.special {
      display: block;
      text-align: center;
      margin-top: 12px;
      padding: 10px;
      background: var(--bg-hover);
      border-radius: 8px;
    }
    .special-text {
      font-size: 13px;
      font-weight: 500;
    }
    .tooltip-footer {
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid var(--border-color);
      text-align: right;
    }
    .tooltip-date {
      font-size: 11px;
      color: var(--text-muted);
    }
    .tooltip-error, .tooltip-loading {
      text-align: center;
      padding: 20px;
    }
    .tooltip-error button {
      margin-top: 10px;
      padding: 6px 12px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
  `]
})
export class LunarIndicatorComponent implements OnInit {
  private lunarService = inject(LunarService);
  private cdr = inject(ChangeDetectorRef);
  private translationService = inject(TranslationService);
  
  data = signal<TodayLunarData | null>(null);
  loading = signal(true);
  error = signal(false);
  showTooltip = signal(false);

  ngOnInit(): void {
    this.loadLunarData();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showTooltip.set(false);
  }

  toggleTooltip(): void {
    this.showTooltip.update(v => !v);
  }

  loadLunarData(): void {
    this.loading.set(true);
    this.error.set(false);

    this.lunarService.getTodayLunar().subscribe({
      next: (response: { success: boolean; data: TodayLunarData }) => {
        if (response.success) {
          this.data.set(response.data);
        } else {
          this.error.set(true);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  getPhaseLabel(phase: string): string {
    const phaseKey = `lunar.${phase.replace('_', '')}`;
    let translated = this.translationService.t(phaseKey);
    if (translated !== phaseKey) {
      return translated;
    }
    const labels: Record<string, string> = {
      'new_moon': this.translationService.t('lunar.newMoon'),
      'waxing_crescent': this.translationService.t('lunar.waxingCrescent'),
      'first_quarter': this.translationService.t('lunar.firstQuarter'),
      'waxing_gibbous': this.translationService.t('lunar.waxingGibbous'),
      'full_moon': this.translationService.t('lunar.fullMoon'),
      'waning_gibbous': this.translationService.t('lunar.waningGibbous'),
      'last_quarter': this.translationService.t('lunar.lastQuarter'),
      'waning_crescent': this.translationService.t('lunar.waningCrescent')
    };
    return labels[phase] || phase;
  }

  getBiodynamicLabel(dayType: string): string {
    const labels: Record<string, string> = {
      'root_day': this.translationService.t('lunar.rootDay'),
      'leaf_day': this.translationService.t('lunar.leafDay'),
      'fruit_day': this.translationService.t('lunar.fruitDay'),
      'flower_day': this.translationService.t('lunar.flowerDay')
    };
    return labels[dayType] || dayType;
  }

  getZodiacLabel(sign: string): string {
    const labels: Record<string, string> = {
      'aries': 'Aries',
      'taurus': 'Tauro',
      'gemini': 'Géminis',
      'cancer': 'Cáncer',
      'leo': 'Leo',
      'virgo': 'Virgo',
      'libra': 'Libra',
      'scorpio': 'Escorpio',
      'sagittarius': 'Sagitario',
      'capricorn': 'Capricornio',
      'aquarius': 'Acuario',
      'pisces': 'Piscis'
    };
    return labels[sign] || sign;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${day} ${months[date.getMonth()]}`;
  }
}