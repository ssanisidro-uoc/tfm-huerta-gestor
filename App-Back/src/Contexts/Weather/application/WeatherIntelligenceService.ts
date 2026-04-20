import { Pool } from 'pg';
import { WeatherAgriculturalRulesRepository } from '../infrastructure/persistence/PostgresWeatherAgriculturalRulesRepository';
import { logger } from '../../Shared/infrastructure/Logger';

export interface WeatherRecommendation {
  id: string;
  action: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  description: string;
  strength: number;
}

export interface WeatherAlert {
  id: string;
  gardenId: string;
  gardenName: string;
  alertType: string;
  severity: string;
  startDate: Date;
  endDate: Date | null;
  affectedTaskIds: string[];
  recommendedActions: string[];
  description: string;
}

export class WeatherIntelligenceService {
  constructor(
    private pool: Promise<Pool>,
    private rulesRepository: WeatherAgriculturalRulesRepository
  ) {}

  async getRecommendationsForForecast(forecast: any[]): Promise<WeatherRecommendation[]> {
    const recommendations: WeatherRecommendation[] = [];
    
    for (const day of forecast.slice(0, 7)) {
      const temp = day.tempAvg || (day.tempMax + day.tempMin) / 2;
      const humidity = day.humidityAvg || (day.humidityMax + day.humidityMin) / 2;
      const precipitation = day.precipitationSum || 0;

      const rules = await this.rulesRepository.findRulesForConditions(temp, humidity, precipitation);

      for (const rule of rules) {
        recommendations.push({
          id: rule.id,
          action: rule.agriculturalAction,
          type: rule.recommendationType,
          severity: rule.urgencyLevel === 'critical' ? 'critical' : rule.urgencyLevel === 'high' ? 'warning' : 'info',
          message: this.formatMessage(rule, day),
          description: rule.description,
          strength: rule.recommendationStrength
        });
      }

      if (day.tempMax > 35) {
        recommendations.push({
          id: 'heat-wave',
          action: 'protection',
          type: 'heat_protection',
          severity: 'critical',
          message: `Temperatura máxima de ${day.tempMax}°C prevista el ${day.date}. Tomar medidas de protección.`,
          description: 'Las temperaturas extremas pueden dañar los cultivos.',
          strength: 10
        });
      }

      if (day.tempMin < 0) {
        recommendations.push({
          id: 'frost-risk',
          action: 'protection',
          type: 'frost_protection',
          severity: 'critical',
          message: `Riesgo de helada el ${day.date}. Temperatura mínima de ${day.tempMin}°C.`,
          description: 'Las heladas pueden destruir cultivos sensibles.',
          strength: 10
        });
      }

      if (day.precipitationSum > 50) {
        recommendations.push({
          id: 'heavy-rain',
          action: 'drainage',
          type: 'heavy_rain',
          severity: 'warning',
          message: `Predicción de lluvia fuerte (${day.precipitationSum}mm) el ${day.date}.`,
          description: 'Las lluvias intensas pueden causar encharcamientos.',
          strength: 7
        });
      }
    }

    return this.deduplicateAndSort(recommendations);
  }

  private formatMessage(rule: any, day: any): string {
    return rule.description
      .replace('{date}', day.date)
      .replace('{temp}', day.tempAvg?.toFixed(1) || 'N/A')
      .replace('{humidity}', day.humidityAvg?.toFixed(0) || 'N/A')
      .replace('{precipitation}', day.precipitationSum?.toFixed(1) || 'N/A');
  }

  private deduplicateAndSort(recommendations: WeatherRecommendation[]): WeatherRecommendation[] {
    const seen = new Map<string, WeatherRecommendation>();
    
    for (const rec of recommendations) {
      const key = rec.action + rec.type;
      const existing = seen.get(key);
      
      if (!existing || rec.strength > existing.strength) {
        seen.set(key, rec);
      }
    }

    return Array.from(seen.values()).sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  async generateWeatherAlerts(gardenId: string, forecast: any[]): Promise<WeatherAlert[]> {
    const pool = await this.pool;
    const alerts: WeatherAlert[] = [];

    const gardenResult = await pool.query(`
      SELECT g.id, g.name FROM gardens g WHERE g.id = $1
    `, [gardenId]);

    if (gardenResult.rows.length === 0) {
      return alerts;
    }

    const garden = gardenResult.rows[0];

    for (const day of forecast.slice(0, 7)) {
      if (day.tempMin < 0 && day.tempMax < 5) {
        alerts.push({
          id: `frost-${gardenId}-${day.date}`,
          gardenId: garden.id,
          gardenName: garden.name,
          alertType: 'frost',
          severity: 'high',
          startDate: new Date(day.date),
          endDate: new Date(day.date),
          affectedTaskIds: [],
          recommendedActions: ['cover_crops', 'delay_watering', 'harvest_frost_sensitive'],
          description: `Riesgo de helada el ${day.date}. Temperatura mínima: ${day.tempMin}°C.`
        });
      }

      if (day.tempMax > 38) {
        alerts.push({
          id: `heat-${gardenId}-${day.date}`,
          gardenId: garden.id,
          gardenName: garden.name,
          alertType: 'heat_wave',
          severity: 'high',
          startDate: new Date(day.date),
          endDate: new Date(day.date),
          affectedTaskIds: [],
          recommendedActions: ['increase_watering', 'provide_shade', 'harvest_heat_sensitive'],
          description: `Ola de calor el ${day.date}. Temperatura máxima: ${day.tempMax}°C.`
        });
      }

      if (day.precipitationSum > 40) {
        alerts.push({
          id: `rain-${gardenId}-${day.date}`,
          gardenId: garden.id,
          gardenName: garden.name,
          alertType: 'heavy_rain',
          severity: 'medium',
          startDate: new Date(day.date),
          endDate: new Date(day.date),
          affectedTaskIds: [],
          recommendedActions: ['check_drainage', 'delay_watering', 'secure_structures'],
          description: `Lluvia fuerte prevista (${day.precipitationSum}mm) el ${day.date}.`
        });
      }
    }

    return alerts;
  }
}
