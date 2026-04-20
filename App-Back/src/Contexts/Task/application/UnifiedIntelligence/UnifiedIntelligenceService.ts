import { Pool } from 'pg';
import { logger } from '../../../Shared/infrastructure/Logger';

export interface UnifiedIntelligence {
  taskId: string;
  gardenId: string;
  plotId?: string;
  plantingId?: string;
  lunar: LunarIntelligence | null;
  weather: WeatherIntelligence | null;
  rotation: RotationIntelligence | null;
  combinedScore: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  summary: string;
  recommendations: UnifiedRecommendation[];
}

export interface LunarIntelligence {
  moonPhase: string;
  moonAge: number;
  bestFor: string[];
  recommendations: string[];
  score: number;
}

export interface WeatherIntelligence {
  currentConditions: {
    temp: number;
    humidity: number;
    precipitation: number;
  };
  forecast: {
    date: string;
    condition: string;
    tempMin: number;
    tempMax: number;
  }[];
  alerts: {
    type: string;
    severity: string;
    description: string;
  }[];
}

export interface RotationIntelligence {
  previousCrop: string | null;
  compatibility: 'excellent' | 'good' | 'poor' | 'forbidden';
  daysSinceLastCrop: number | null;
  recommendations: string[];
}

export interface UnifiedRecommendation {
  source: 'lunar' | 'weather' | 'rotation';
  type: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  action?: string;
}

export class UnifiedIntelligenceService {
  constructor(private pool: Pool) {}

  async getIntelligenceForTask(taskId: string): Promise<UnifiedIntelligence | null> {
    const taskResult = await this.pool.query(`
      SELECT t.*, p.name as plot_name, p.garden_id, pl.name as crop_name
      FROM tasks t
      LEFT JOIN plots p ON t.plot_id = p.id
      LEFT JOIN plantings pl ON t.planting_id = pl.id
      WHERE t.id = $1
    `, [taskId]);

    if (taskResult.rows.length === 0) {
      return null;
    }

    const task = taskResult.rows[0];
    const [lunar, weather, rotation] = await Promise.all([
      this.getLunarIntelligence(task.scheduled_date),
      this.getWeatherIntelligence(task.garden_id),
      this.getRotationIntelligence(task.plot_id, task.planting_id)
    ]);

    const recommendations = this.mergeRecommendations(lunar, weather, rotation);
    const combinedScore = this.calculateCombinedScore(lunar, weather, rotation);
    const priority = this.determinePriority(combinedScore, recommendations);
    const summary = this.generateSummary(task, lunar, weather, rotation);

    return {
      taskId: task.id,
      gardenId: task.garden_id,
      plotId: task.plot_id,
      plantingId: task.planting_id,
      lunar,
      weather,
      rotation,
      combinedScore,
      priority,
      summary,
      recommendations
    };
  }

  async getIntelligenceForGarden(gardenId: string, daysAhead: number = 7): Promise<UnifiedIntelligence[]> {
    const tasksResult = await this.pool.query(`
      SELECT t.id, t.scheduled_date, t.garden_id, t.plot_id, t.planting_id, 
             t.task_type, t.title, t.status,
             p.name as plot_name, pl.name as crop_name
      FROM tasks t
      LEFT JOIN plots p ON t.plot_id = p.id
      LEFT JOIN plantings pl ON t.planting_id = pl.id
      WHERE t.garden_id = $1 
        AND t.status = 'pending'
        AND t.scheduled_date >= CURRENT_DATE
        AND t.scheduled_date <= CURRENT_DATE + $2
      ORDER BY t.scheduled_date ASC
    `, [gardenId, daysAhead]);

    const intelligences: UnifiedIntelligence[] = [];

    for (const task of tasksResult.rows) {
      const intelligence = await this.getIntelligenceForTask(task.id);
      if (intelligence) {
        intelligences.push(intelligence);
      }
    }

    return intelligences;
  }

  private async getLunarIntelligence(date: Date): Promise<LunarIntelligence | null> {
    try {
      const lunarDate = new Date(date);
      const moonAge = this.calculateMoonAge(lunarDate);
      const moonPhase = this.getMoonPhase(moonAge);
      const bestFor = this.getBestFor(moonPhase);

      const query = `
        SELECT recommendation_type, description 
        FROM lunar_task_rules 
        WHERE $1 BETWEEN start_day AND end_day
          AND is_active = true
        ORDER BY recommendation_score DESC
        LIMIT 3
      `;

      const result = await this.pool.query(query, [moonAge]);

      const recommendations = result.rows.map(r => `${r.recommendation_type}: ${r.description}`);
      const score = this.calculateLunarScore(moonPhase);

      return {
        moonPhase,
        moonAge,
        bestFor,
        recommendations,
        score
      };
    } catch (error) {
      logger.debug(`Error getting lunar intelligence: ${(error as Error).message}`);
      return null;
    }
  }

  private async getWeatherIntelligence(gardenId: string): Promise<WeatherIntelligence | null> {
    try {
      const weatherResult = await this.pool.query(`
        SELECT w.*, wl.timezone
        FROM weather_data w
        JOIN weather_locations wl ON w.weather_location_id = wl.id
        WHERE wl.id = (
          SELECT weather_location_id FROM gardens WHERE id = $1
        )
        AND w.data_type = 'forecast'
        AND w.weather_date >= CURRENT_DATE
        ORDER BY w.weather_date ASC
        LIMIT 7
      `, [gardenId]);

      if (weatherResult.rows.length === 0) {
        return null;
      }

      const currentResult = await this.pool.query(`
        SELECT temp_avg, humidity_avg, precipitation_sum
        FROM weather_data w
        JOIN weather_locations wl ON w.weather_location_id = wl.id
        WHERE wl.id = (SELECT weather_location_id FROM gardens WHERE id = $1)
        AND w.data_type = 'current'
        ORDER BY w.forecast_generated_at DESC
        LIMIT 1
      `, [gardenId]);

      const alerts: WeatherIntelligence['alerts'] = [];
      const forecast: WeatherIntelligence['forecast'] = [];

      for (const row of weatherResult.rows) {
        const tempMin = parseFloat(row.temp_min);
        const tempMax = parseFloat(row.temp_max);

        forecast.push({
          date: row.weather_date,
          condition: row.weather_code ? this.getWeatherCondition(row.weather_code) : 'unknown',
          tempMin,
          tempMax
        });

        if (tempMin < 0) {
          alerts.push({ type: 'frost', severity: 'critical', description: `Helada prevista: ${tempMin}°C` });
        }
        if (tempMax > 38) {
          alerts.push({ type: 'heat', severity: 'critical', description: `Ola de calor: ${tempMax}°C` });
        }
        if (parseFloat(row.precipitation_sum) > 40) {
          alerts.push({ type: 'rain', severity: 'medium', description: `Lluvia fuerte: ${row.precipitation_sum}mm` });
        }
      }

      const current = currentResult.rows[0] || { temp_avg: null, humidity_avg: null, precipitation_sum: null };

      return {
        currentConditions: {
          temp: parseFloat(current.temp_avg) || 0,
          humidity: parseFloat(current.humidity_avg) || 0,
          precipitation: parseFloat(current.precipitation_sum) || 0
        },
        forecast,
        alerts
      };
    } catch (error) {
      logger.debug(`Error getting weather intelligence: ${(error as Error).message}`);
      return null;
    }
  }

  private async getRotationIntelligence(plotId: string | null, plantingId: string | null): Promise<RotationIntelligence | null> {
    if (!plotId) return null;

    try {
      const lastPlantingResult = await this.pool.query(`
        SELECT pl.crop_id, c.name as crop_name, pl.planted_at
        FROM plantings pl
        JOIN crops c ON pl.crop_id = c.id
        WHERE pl.plot_id = $1
          AND pl.status = 'completed'
          AND pl.planted_at < NOW()
        ORDER BY pl.planted_at DESC
        LIMIT 1
      `, [plotId]);

      if (lastPlantingResult.rows.length === 0) {
        return { previousCrop: null, compatibility: 'excellent', daysSinceLastCrop: null, recommendations: ['Sin cultivos anteriores - cualquier cultivo es apropiado'] };
      }

      const lastCrop = lastPlantingResult.rows[0];
      const daysSince = Math.floor((Date.now() - new Date(lastCrop.planted_at).getTime()) / (1000 * 60 * 60 * 24));

      if (plantingId) {
        const currentResult = await this.pool.query(`SELECT crop_id FROM plantings WHERE id = $1`, [plantingId]);
        if (currentResult.rows.length > 0) {
          const currentCropId = currentResult.rows[0].crop_id;
          
          const ruleResult = await this.pool.query(`
            SELECT compatibility, recommendation 
            FROM crop_rotation_rules 
            WHERE (crop_id = $1 AND following_crop_id = $2)
               OR (crop_id = $2 AND following_crop_id = $1)
            LIMIT 1
          `, [lastCrop.crop_id, currentCropId]);

          if (ruleResult.rows.length > 0) {
            const rule = ruleResult.rows[0];
            return {
              previousCrop: lastCrop.crop_name,
              compatibility: rule.compatibility,
              daysSinceLastCrop: daysSince,
              recommendations: rule.recommendation ? [rule.recommendation] : []
            };
          }
        }
      }

      return {
        previousCrop: lastCrop.crop_name,
        compatibility: daysSince > 60 ? 'good' : 'poor',
        daysSinceLastCrop: daysSince,
        recommendations: daysSince < 30 ? ['Recomendado esperar antes de plantar'] : []
      };
    } catch (error) {
      logger.debug(`Error getting rotation intelligence: ${(error as Error).message}`);
      return null;
    }
  }

  private mergeRecommendations(
    lunar: LunarIntelligence | null,
    weather: WeatherIntelligence | null,
    rotation: RotationIntelligence | null
  ): UnifiedRecommendation[] {
    const recommendations: UnifiedRecommendation[] = [];

    if (lunar) {
      for (const rec of lunar.recommendations) {
        recommendations.push({
          source: 'lunar',
          type: 'timing',
          title: 'Influencia lunar',
          description: rec,
          priority: lunar.score > 7 ? 'high' : 'medium'
        });
      }
    }

    if (weather) {
      for (const alert of weather.alerts) {
        recommendations.push({
          source: 'weather',
          type: alert.type,
          title: `Alerta meteorológica: ${alert.type}`,
          description: alert.description,
          priority: alert.severity === 'critical' ? 'critical' : 'high'
        });
      }
    }

    if (rotation) {
      recommendations.push({
        source: 'rotation',
        type: 'compatibility',
        title: 'Rotación de cultivos',
        description: rotation.previousCrop 
          ? `Cultivo anterior: ${rotation.previousCrop} (${rotation.compatibility})`
          : 'Sin restricciones de rotación',
        priority: rotation.compatibility === 'forbidden' ? 'critical' : 'low',
        action: rotation.recommendations[0]
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private calculateCombinedScore(
    lunar: LunarIntelligence | null,
    weather: WeatherIntelligence | null,
    _rotation: RotationIntelligence | null
  ): number {
    let score = 50;

    if (lunar) score += lunar.score * 3;

    if (weather) {
      for (const alert of weather.alerts) {
        if (alert.severity === 'critical') score += 20;
        else if (alert.severity === 'medium') score += 10;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  private determinePriority(score: number, recommendations: UnifiedRecommendation[]): 'critical' | 'high' | 'medium' | 'low' {
    const hasCritical = recommendations.some(r => r.priority === 'critical');
    if (hasCritical) return 'critical';

    if (score > 80) return 'high';
    if (score > 50) return 'medium';
    return 'low';
  }

  private generateSummary(
    task: any,
    lunar: LunarIntelligence | null,
    weather: WeatherIntelligence | null,
    rotation: RotationIntelligence | null
  ): string {
    const parts: string[] = [];

    if (lunar) {
      parts.push(`Luna ${lunar.moonPhase} (${lunar.moonAge.toFixed(1)} días)`);
    }

    if (weather && weather.alerts.length > 0) {
      parts.push(`${weather.alerts.length} alerta(s) meteorológica(s)`);
    }

    if (rotation && rotation.previousCrop) {
      parts.push(`Rotación: ${rotation.previousCrop}`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'Sin inteligencia disponible';
  }

  private calculateMoonAge(date: Date): number {
    const knownNewMoon = new Date('2024-01-11T11:57:00Z');
    const lunarCycle = 29.53059;
    const diffTime = date.getTime() - knownNewMoon.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return ((diffDays % lunarCycle) + lunarCycle) % lunarCycle;
  }

  private getMoonPhase(age: number): string {
    if (age < 1.85) return 'luna nueva';
    if (age < 7.38) return 'creciente';
    if (age < 9.23) return 'cuarto creciente';
    if (age < 14.77) return 'creciente';
    if (age < 16.61) return 'luna llena';
    if (age < 22.15) return 'menguante';
    if (age < 23.99) return 'cuarto menguante';
    return 'menguante';
  }

  private getBestFor(phase: string): string[] {
    const phases: Record<string, string[]> = {
      'luna nueva': ['siembra', 'plantacion'],
      'creciente': ['siembra', 'injerto', 'cosecha'],
      'cuarto creciente': ['siembra', 'transplante'],
      'luna llena': ['cosecha', 'siembra', 'recoleccion'],
      'menguante': ['poda', 'abonada', 'control_plagas'],
      'cuarto menguante': ['poda', 'control_plagas', 'cosecha']
    };
    return phases[phase] || [];
  }

  private calculateLunarScore(phase: string): number {
    const scores: Record<string, number> = {
      'luna nueva': 5,
      'creciente': 8,
      'cuarto creciente': 7,
      'luna llena': 9,
      'menguante': 6,
      'cuarto menguante': 5
    };
    return scores[phase] || 5;
  }

  private getWeatherCondition(code: number): string {
    const codes: Record<number, string> = {
      0: 'despejado',
      1: 'poco_nuboso',
      2: 'nuboso',
      3: 'cubierto',
      45: 'niebla',
      51: 'lluvia_leve',
      61: 'lluvia',
      71: 'nieve',
      80: 'chubasco',
      95: 'tormenta'
    };
    return codes[code] || 'desconocido';
  }
}
