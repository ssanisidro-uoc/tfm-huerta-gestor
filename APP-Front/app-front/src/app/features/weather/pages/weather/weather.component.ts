import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';
import { WeatherService, WeatherData, GardenWeather, IrrigationRecommendation } from '../../services/weather.service';
import { GardenService, Garden, GardensResponse } from '../../../gardens/services/garden.service';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="weather-container">
      <div class="header">
        <h1>🌤️ {{ 'weather.title' | t }}</h1>
        <p class="subtitle">{{ 'weather.subtitle' | t }}</p>
      </div>

      <div class="garden-selector" *ngIf="gardens().length > 0">
        <label for="garden-select">{{ 'weather.selectGarden' | t }}:</label>
        <select 
          id="garden-select" 
          [ngModel]="selectedGardenId()" 
          (ngModelChange)="onGardenChange($event)"
          class="garden-select">
          <option value="">{{ 'weather.selectGardenPlaceholder' | t }}</option>
          <option *ngFor="let garden of gardens()" [value]="garden.id">
            {{ garden.name }}
          </option>
        </select>
      </div>

      <div class="loading" *ngIf="weatherService.loading()">
        <div class="spinner"></div>
        <p>{{ 'weather.loading' | t }}</p>
      </div>

      <div class="error" *ngIf="weatherService.error() as error">
        <p class="error-message">{{ error }}</p>
        <button class="btn-retry" (click)="retry()">{{ 'weather.retry' | t }}</button>
      </div>

      <div class="weather-content" *ngIf="currentWeather() && !weatherService.loading()">
        <div class="irrigation-card" [ngClass]="irrigationRecommendation()?.status">
          <div class="irrigation-icon">
            <span *ngIf="irrigationRecommendation()?.status === 'skip'">🚫</span>
            <span *ngIf="irrigationRecommendation()?.status === 'reduce'">⬇️</span>
            <span *ngIf="irrigationRecommendation()?.status === 'normal'">💧</span>
            <span *ngIf="irrigationRecommendation()?.status === 'increase'">⬆️</span>
          </div>
          <div class="irrigation-content">
            <h3>{{ 'weather.irrigationRecommendation' | t }}</h3>
            <p class="irrigation-message">{{ irrigationRecommendation()?.message }}</p>
            <p class="irrigation-reason">{{ irrigationRecommendation()?.reason }}</p>
            <p class="irrigation-amount" *ngIf="irrigationRecommendation()?.suggestedAmountMm">
              {{ 'weather.suggestedAmount' | t }}: <strong>{{ irrigationRecommendation()?.suggestedAmountMm | number:'1.1-1' }} mm</strong>
            </p>
          </div>
        </div>

        <div class="forecast-section">
          <h2>📅 {{ 'weather.forecast14days' | t }}</h2>
          <div class="forecast-grid">
            <div 
              class="forecast-card" 
              *ngFor="let day of currentWeather(); let i = index"
              [ngClass]="{'today': i === 0, 'rainy': day.precipitationProbability > 50}">
              <div class="forecast-date">
                <span class="day-name">{{ getDayName(day.date) }}</span>
                <span class="day-date">{{ formatDate(day.date) }}</span>
              </div>
              <div class="forecast-weather">
                <span class="weather-icon">{{ getWeatherIcon(day.weatherCode) }}</span>
                <span class="weather-desc">{{ day.weatherDescription }}</span>
              </div>
              <div class="forecast-temps">
                <span class="temp-max">{{ day.tempMax | number:'1.0-0' }}°</span>
                <span class="temp-min">{{ day.tempMin | number:'1.0-0' }}°</span>
              </div>
              <div class="forecast-precip" *ngIf="day.precipitationProbability > 0">
                <span class="precip-prob">{{ day.precipitationProbability }}%</span>
                <span class="precip-amount" *ngIf="day.precipitationSum > 0">{{ day.precipitationSum | number:'1.0-0' }}mm</span>
              </div>
              <div class="forecast-eto" *ngIf="day.et0 > 0">
                <span class="eto-label">ET0:</span>
                <span class="eto-value">{{ day.et0 | number:'1.1-1' }}mm</span>
              </div>
            </div>
          </div>
        </div>

        <div class="location-info" *ngIf="currentGardenWeather()">
          <p>📍 {{ 'weather.location' | t }}: <strong>{{ currentGardenWeather()?.location?.locationName || currentGardenWeather()?.location?.city || ('weather.noLocation' | t) }}</strong></p>
          <p>🕐 {{ 'weather.timezone' | t }}: {{ currentGardenWeather()?.location?.timezone }}</p>
        </div>
      </div>

      <div class="empty-state" *ngIf="!currentWeather() && !weatherService.loading() && gardens().length === 0">
        <p>{{ 'weather.noGardensConfigured' | t }}</p>
        <a routerLink="/gardens/create" class="btn-primary">{{ 'weather.createGarden' | t }}</a>
      </div>
    </div>
  `,
  styleUrl: './weather.component.scss'
})
export class WeatherComponent implements OnInit {
  weatherService = inject(WeatherService);
  private gardenService = inject(GardenService);

  gardens = signal<Garden[]>([]);
  selectedGardenId = signal<string>('');
  currentWeather = signal<WeatherData[] | null>(null);
  currentGardenWeather = signal<GardenWeather | null>(null);
  irrigationRecommendation = signal<IrrigationRecommendation | null>(null);

  ngOnInit(): void {
    this.loadGardens();
  }

  loadGardens(): void {
    this.gardenService.getGardens().subscribe((response: GardensResponse | null) => {
      if (response && response.gardens) {
        this.gardens.set(response.gardens);
        if (response.gardens.length > 0) {
          this.selectedGardenId.set(response.gardens[0].id);
          this.loadWeather(response.gardens[0].id);
        }
      }
    });
  }

  onGardenChange(gardenId: string): void {
    this.selectedGardenId.set(gardenId);
    if (gardenId) {
      this.loadWeather(gardenId);
    }
  }

  loadWeather(gardenId: string): void {
    this.weatherService.getGardenWeather(gardenId).subscribe((response: { success: boolean; data: GardenWeather } | null) => {
      if (response && response.success) {
        this.currentWeather.set(response.data.forecast);
        this.currentGardenWeather.set(response.data);
        this.calculateIrrigation(response.data.forecast);
      }
    });
  }

  private calculateIrrigation(forecast: WeatherData[]): void {
    const next3Days = forecast.slice(0, 3);
    const totalPrecipitation = next3Days.reduce((sum, day) => sum + day.precipitationSum, 0);
    const avgProbability = next3Days.reduce((sum, day) => sum + day.precipitationProbability, 0) / 3;
    const avgEt0 = next3Days.reduce((sum, day) => sum + day.et0, 0) / 3;

    let status: 'skip' | 'reduce' | 'normal' | 'increase' = 'normal';
    let message = 'Riego normal - Condiciones climáticas habituales';
    let reason = 'ET0 promedio: ' + avgEt0.toFixed(1) + 'mm/día';
    let suggestedAmountMm = avgEt0;

    if (totalPrecipitation > 15 || avgProbability > 70) {
      status = 'skip';
      message = 'No requiere riego - Probabilidad alta de lluvia';
      reason = 'Precipitación: ' + totalPrecipitation.toFixed(1) + 'mm, Probabilidad: ' + avgProbability.toFixed(0) + '%';
      suggestedAmountMm = 0;
    } else if (totalPrecipitation > 5 || avgProbability > 40) {
      status = 'reduce';
      message = 'Reducir riego - Lluvia esperada';
      reason = 'Precipitación: ' + totalPrecipitation.toFixed(1) + 'mm, Probabilidad: ' + avgProbability.toFixed(0) + '%';
      suggestedAmountMm = Math.max(0, avgEt0 * 0.5);
    } else if (avgEt0 > 5) {
      status = 'increase';
      message = 'Aumentar riego - Alta evapotranspiración';
      reason = 'ET0 promedio: ' + avgEt0.toFixed(1) + 'mm/día';
      suggestedAmountMm = avgEt0 * 1.2;
    }

    this.irrigationRecommendation.set({
      status,
      message,
      reason,
      suggestedAmountMm
    });
  }

  retry(): void {
    const gardenId = this.selectedGardenId();
    if (gardenId) {
      this.loadWeather(gardenId);
    }
  }

  getDayName(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === tomorrow.toDateString()) return 'Mañana';

    return date.toLocaleDateString('es-ES', { weekday: 'short' });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  getWeatherIcon(code: number): string {
    if (code === 0) return '☀️';
    if (code === 1 || code === 2) return '⛅';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code === 51 || code === 53 || code === 55 || code === 61 || code === 63 || code === 65 || code === 80 || code === 81 || code === 82) return '🌧️';
    if (code === 71 || code === 73 || code === 75 || code === 77 || code === 85 || code === 86) return '❄️';
    if (code === 95 || code === 96 || code === 99) return '⛈️';
    return '🌡️';
  }
}