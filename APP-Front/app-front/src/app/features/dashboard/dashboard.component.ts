import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/services/i18n/translate.pipe';
import { TranslationService } from '../../core/services/i18n/translation.service';
import { GardenService } from '../gardens/services/garden.service';
import { CropSummary, DashboardService, PlotSummary, TaskItem } from './dashboard.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { WeatherIntelligenceService } from '../weather/services/weather-intelligence.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  dashboardService: DashboardService = inject(DashboardService);
  gardenService: GardenService = inject(GardenService);
  weatherService: WeatherIntelligenceService = inject(WeatherIntelligenceService);
  private t = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);

  today = new Date();

  weatherAlerts = this.weatherService.alerts;
  weatherRecommendations = this.weatherService.recommendations;
  weatherForecast = this.weatherService.forecast;
  weatherLoading = this.weatherService.loading;

  selectedGardenId = signal<string>('');
  hasGardens = signal(false);
  hasGardenWithLocation = signal(false);

  gardens = this.gardenService.gardens;

  pendingCount = computed(() => this.dashboardService.getPendingTasksCount());

  donutSegments = computed(() => {
    const stats = this.dashboardService.taskStats();
    if (!stats.length) return [];
    const circumference = 2 * Math.PI * 35;
    let offset = 0;
    return stats.map((s) => {
      const dash = (s.percentage / 100) * circumference;
      const segment = {
        type: s.type,
        color: s.color,
        dasharray: `${dash - 1} ${circumference - dash + 1}`,
        dashoffset: -offset,
      };
      offset += dash;
      return segment;
    });
  });

  currentMonth = (() => {
    const m = new Date().toLocaleDateString('es-ES', { month: 'long' });
    return m.charAt(0).toUpperCase() + m.slice(1);
  })();

  ngOnInit(): void {
    this.gardenService.getGardens().subscribe({
      next: (response) => {
        if (response && response.gardens && response.gardens.length > 0) {
          this.hasGardens.set(true);
          const firstGarden = response.gardens[0];
          this.selectedGardenId.set(firstGarden.id);
          
          const gardenWithLocation = response.gardens.find(g => 
            g.location?.latitude && g.location?.longitude
          );
          this.hasGardenWithLocation.set(!!gardenWithLocation);
          
          if (gardenWithLocation) {
            this.loadWeatherData(gardenWithLocation.id);
          }
        } else {
          this.hasGardens.set(false);
          this.hasGardenWithLocation.set(false);
        }
      }
    });
    this.dashboardService.loadDashboardData(() => {
      this.cdr.detectChanges();
    });
  }

  onGardenChange(gardenId: string): void {
    this.selectedGardenId.set(gardenId);
    const garden = this.gardens().find(g => g.id === gardenId);
    if (garden?.location?.latitude && garden?.location?.longitude) {
      this.hasGardenWithLocation.set(true);
      this.loadWeatherData(gardenId);
    } else {
      this.hasGardenWithLocation.set(false);
    }
  }

  private loadWeatherData(gardenId: string): void {
    console.log('Loading weather for garden:', gardenId);
    this.weatherService.getWeatherAlerts(gardenId).subscribe();
    this.weatherService.getWeatherRecommendations(gardenId).subscribe();
  }

  getCropsForPlot(plotId: string): CropSummary[] {
    return this.dashboardService.getCropsForPlot(plotId);
  }

  getNextTaskForPlot(plotId: string): TaskItem | null {
    const tasks = this.dashboardService.todayTasks();
    const plotCropNames = this.getCropsForPlot(plotId).map((c) => c.name.toLowerCase());
    const task = tasks.find(
      (t) => t.status === 'pending' && plotCropNames.some((name) => t.title.toLowerCase().includes(name))
    );
    return task || null;
  }

  getDaysSincePlanting(crop: CropSummary): number {
    const now = new Date();
    const planted = new Date(crop.planted_at);
    return Math.floor((now.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24));
  }

  getCropProgressClass(crop: CropSummary): string {
    const pct = crop.growth_percentage || 0;
    if (pct >= 80) return 'progress-orange';
    if (pct >= 50) return 'progress-blue';
    return 'progress-green';
  }

  getPlotStatusClass(plot: PlotSummary): string {
    if (!plot.is_active) return 'dot-yellow';
    const hasCrops = this.getCropsForPlot(plot.id).length > 0;
    return hasCrops ? 'dot-green' : 'dot-orange';
  }

  getTaskIcon(type: string): string {
    const icons: Record<string, string> = {
      fitosanitario: '🌿',
      riego: '💧',
      cosecha: '🥬',
      abonado: '🌾',
      mantenimiento: '🔧',
      otro: '📋',
    };
    return icons[type] || '📋';
  }

  getTaskLabel(type: string): string {
    return this.taskLabels[type] || type;
  }

  getActivityEmoji(type: string): string {
    return this.activityEmojis[type] || '📋';
  }

  private taskLabels: Record<string, string> = {
    riego: 'Riego',
    fitosanitario: 'Fitosanitario',
    cosecha: 'Cosecha',
    abonado: 'Abonado',
    mantenimiento: 'Mantenimiento',
    otro: 'Otro',
  };

  private activityEmojis: Record<string, string> = {
    planting: '🌱',
    harvest: '🥦',
    irrigation: '💧',
    fertilizing: '🌿',
    treatment: '🧪',
    pruning: '✂️',
    other: '📋',
  };

  getWeatherIcon(code: number): string {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 49) return '🌫️';
    if (code <= 59) return '🌧️';
    if (code <= 69) return '🌨️';
    if (code <= 79) return '❄️';
    if (code <= 82) return '🌧️';
    if (code <= 86) return '🌨️';
    return '⛈️';
  }

  getWeatherRecTitle(key: string): string {
    const translations: Record<string, string> = {
      waterPlants: 'dashboard.weatherRecs.waterPlants',
      rainExpected: 'dashboard.weatherRecs.rainExpected',
      heatWarning: 'dashboard.weatherRecs.heatWarning',
      stormWarning: 'dashboard.weatherRecs.stormWarning',
      fungusRisk: 'dashboard.weatherRecs.fungusRisk',
      windWarning: 'dashboard.weatherRecs.windWarning',
      frostWarning: 'dashboard.weatherRecs.frostWarning'
    };
    return translations[key] || key;
  }

  getWeatherRecMessage(rec: any): string {
    if (!rec.params) return '';
    const paramKeys = Object.keys(rec.params);
    if (paramKeys.length === 0) return '';
    const key = paramKeys[0];
    const value = rec.params[key];
    
    if (key === 'temp') {
      return `${value}°`;
    }
    
    const unitKey = `dashboard.weatherRecs.units.${key}`;
    const unit = this.t.t(unitKey);
    
    if (unit && unit !== unitKey) {
      return `${unit}: ${value}%`;
    }
    return `${value}%`;
  }

  getWeatherName(code: number): string {
    if (code === 0) return 'Sol';
    if (code <= 3) return 'Nubes';
    if (code <= 49) return 'Niebla';
    if (code <= 59) return 'Llovizna';
    if (code <= 69) return 'Nieve';
    if (code <= 79) return 'Nieve';
    if (code <= 82) return 'Lluvia';
    if (code <= 86) return 'Nieve';
    return 'Tormenta';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === tomorrow.toDateString()) return 'Mañana';
    
    return date.toLocaleDateString('es', { weekday: 'short', day: 'numeric' });
  }

  getTaskRelativeDate(scheduledDate: string | Date | undefined, postponedUntil?: Date | null | undefined): string {
    if (!scheduledDate) return '';
    
    const date = postponedUntil ? new Date(postponedUntil) : new Date(scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (dateOnly.getTime() === today.getTime()) return 'Hoy';
    if (dateOnly.getTime() === tomorrow.getTime()) return 'Mañana';
    
    return date.toLocaleDateString('es', { weekday: 'short', day: 'numeric' });
  }

  getAlertSeverity(priority: string): string {
    if (priority === 'high') return 'error';
    if (priority === 'medium') return 'warning';
    return 'info';
  }

  getAlertLink(alert: any): string[] {
    if (alert.entity_type === 'task') {
      return ['/tasks'];
    }
    if (alert.entity_type === 'planting') {
      return ['/gardens'];
    }
    return ['/calendar'];
  }
}
