import { Pool } from 'pg';
import { logger } from '../../Shared/infrastructure/Logger';

export interface WeatherAlert {
  id: string;
  garden_id: string;
  weather_location_id?: string;
  weather_daily_id?: string;
  weather_rule_id?: string;
  alert_date: Date;
  event_start_date: Date;
  event_end_date?: Date;
  alert_type: string;
  alert_category?: string;
  severity_level: string;
  title: string;
  description: string;
  recommended_actions?: string[];
  is_acknowledged: boolean;
  acknowledged_at?: Date;
  acknowledged_by?: string;
  is_active: boolean;
  created_at: Date;
}

export class WeatherAlertsRepository {
  constructor(private pool: Pool) {}

  async findByGarden(gardenId: string, limit: number = 50): Promise<WeatherAlert[]> {
    const query = `
      SELECT * FROM weather_alerts 
      WHERE garden_id = $1 AND is_active = true
      ORDER BY event_start_date ASC
      LIMIT $2
    `;
    const result = await this.pool.query(query, [gardenId, limit]);
    return result.rows;
  }

  async findActive(gardenId: string): Promise<WeatherAlert[]> {
    const query = `
      SELECT * FROM weather_alerts 
      WHERE garden_id = $1 AND is_active = true AND is_acknowledged = false
      ORDER BY severity_level DESC, event_start_date ASC
    `;
    const result = await this.pool.query(query, [gardenId]);
    return result.rows;
  }

  async acknowledge(alertId: string, userId: string): Promise<void> {
    const query = `
      UPDATE weather_alerts 
      SET is_acknowledged = true, acknowledged_at = NOW(), acknowledged_by = $2
      WHERE id = $1
    `;
    await this.pool.query(query, [alertId, userId]);
  }

  async create(alert: Partial<WeatherAlert>): Promise<WeatherAlert> {
    const query = `
      INSERT INTO weather_alerts (
        garden_id, weather_location_id, weather_daily_id, weather_rule_id,
        alert_date, event_start_date, event_end_date,
        alert_type, alert_category, severity_level, title, description,
        recommended_actions, is_active, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, NOW())
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      alert.garden_id, alert.weather_location_id, alert.weather_daily_id, alert.weather_rule_id,
      alert.alert_date, alert.event_start_date, alert.event_end_date,
      alert.alert_type, alert.alert_category, alert.severity_level, alert.title, alert.description,
      alert.recommended_actions || []
    ]);

    return result.rows[0];
  }
}

export class WeatherAlertCreator {
  constructor(private pool: Pool) {}

  async createFromForecast(gardenId: string, forecast: any[]): Promise<number> {
    let createdCount = 0;

    for (const day of forecast.slice(0, 7)) {
      const alerts = this.detectAlerts(day);
      
      for (const alert of alerts) {
        const existing = await this.checkExisting(gardenId, alert.alertType, day.date);
        if (existing) continue;

        await this.pool.query(`
          INSERT INTO weather_alerts (
            garden_id, alert_date, event_start_date, event_end_date,
            alert_type, severity_level, title, description,
            recommended_actions, is_active, created_at
          ) VALUES ($1, NOW(), $2, $2, $3, $4, $5, $6, $7, true, NOW())
        `, [
          gardenId, day.date, alert.alertType, alert.severity,
          alert.title, alert.description, alert.actions
        ]);
        createdCount++;
      }
    }

    return createdCount;
  }

  private detectAlerts(forecast: any): { alertType: string; severity: string; title: string; description: string; actions: string[] }[] {
    const alerts = [];
    const tempMin = forecast.tempMin;
    const tempMax = forecast.tempMax;
    const precip = forecast.precipitationSum || 0;

    if (tempMin < 0) {
      alerts.push({
        alertType: 'frost',
        severity: 'critical',
        title: 'Alerta de helada',
        description: `Temperatura mínima de ${tempMin}°C prevista`,
        actions: ['Cubrir cultivos sensibles', 'Retrasar riego', 'Recoger cosecha sensible']
      });
    }

    if (tempMax > 38) {
      alerts.push({
        alertType: 'heat_wave',
        severity: 'critical',
        title: 'Alerta de ola de calor',
        description: `Temperatura máxima de ${tempMax}°C prevista`,
        actions: ['Aumentar riego', 'Proporcionar sombra', 'Cosechar antes si es necesario']
      });
    }

    if (precip > 40) {
      alerts.push({
        alertType: 'heavy_rain',
        severity: 'medium',
        title: 'Alerta de lluvia intensa',
        description: `Precipitación de ${precip}mm prevista`,
        actions: ['Revisar drenaje', 'Asegurar estructuras', 'Retrasar riego']
      });
    }

    return alerts;
  }

  private async checkExisting(gardenId: string, alertType: string, date: string): Promise<boolean> {
    const result = await this.pool.query(`
      SELECT id FROM weather_alerts 
      WHERE garden_id = $1 AND alert_type = $2 AND event_start_date = $3 AND is_active = true
    `, [gardenId, alertType, date]);
    return result.rows.length > 0;
  }
}
