import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/services/i18n/translate.pipe';
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
  private cdr = inject(ChangeDetectorRef);

  today = new Date();

  weatherAlerts = this.weatherService.alerts;
  weatherRecommendations = this.weatherService.recommendations;
  weatherLoading = this.weatherService.loading;

  selectedGardenId = signal<string>('');

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
          const firstGarden = response.gardens[0];
          this.selectedGardenId.set(firstGarden.id);
          this.loadWeatherData(firstGarden.id);
        }
      }
    });
    this.dashboardService.loadDashboardData(() => {
      this.cdr.detectChanges();
    });
  }

  onGardenChange(gardenId: string): void {
    this.selectedGardenId.set(gardenId);
    this.loadWeatherData(gardenId);
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
}
