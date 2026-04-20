import { Pool } from 'pg';
import { OpenMeteoClient, WeatherData } from '../../Shared/infrastructure/OpenMeteoClient';
import { NominatimClient } from '../../Shared/infrastructure/NominatimClient';
import { logger } from '../../Shared/infrastructure/Logger';

export interface WeatherLocation {
  id: string;
  latitude: number;
  longitude: number;
  locationName: string | null;
  city: string | null;
  region: string | null;
  country: string;
  timezone: string;
  climateZone: string | null;
}

export interface GardenWeather {
  gardenId: string;
  gardenName: string;
  location: WeatherLocation;
  forecast: WeatherData[];
  irrigationRecommendation: string;
}

export interface IrrigationRecommendation {
  status: 'skip' | 'reduce' | 'normal' | 'increase';
  message: string;
  reason: string;
  suggestedAmountMm: number;
}

export class WeatherService {
  constructor(
    private pool: Promise<Pool>,
    private openMeteoClient: OpenMeteoClient,
    private nominatimClient: NominatimClient
  ) {}

  async getLocations(): Promise<WeatherLocation[]> {
    const pool = await this.pool;
    const result = await pool.query(`
      SELECT id, latitude, longitude, location_name, city, region, country, timezone, climate_zone
      FROM weather_locations
      WHERE is_active = true
      ORDER BY location_name NULLS LAST, city NULLS LAST
    `);

    return result.rows.map(row => ({
      id: row.id,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      locationName: row.location_name,
      city: row.city,
      region: row.region,
      country: row.country,
      timezone: row.timezone,
      climateZone: row.climate_zone
    }));
  }

  async getOrCreateLocation(
    latitude: number,
    longitude: number,
    locationName?: string
  ): Promise<WeatherLocation> {
    const pool = await this.pool;
    const latRounded = Math.round(latitude * 1000) / 1000;
    const lonRounded = Math.round(longitude * 1000) / 1000;

    let result = await pool.query(`
      SELECT id, latitude, longitude, location_name, city, region, country, timezone, climate_zone
      FROM weather_locations
      WHERE ROUND(latitude::NUMERIC, 3) = $1
        AND ROUND(longitude::NUMERIC, 3) = $2
        AND is_active = true
    `, [latRounded, lonRounded]);

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        id: row.id,
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        locationName: row.location_name,
        city: row.city,
        region: row.region,
        country: row.country,
        timezone: row.timezone,
        climateZone: row.climate_zone
      };
    }

    const newLocation = await this.createLocation(latitude, longitude, locationName);
    return newLocation;
  }

  private async createLocation(
    latitude: number,
    longitude: number,
    locationName?: string
  ): Promise<WeatherLocation> {
    const timezone = this.estimateTimezone(latitude, longitude);
    
    const pool = await this.pool;
    
    const result = await pool.query(`
      INSERT INTO weather_locations (latitude, longitude, location_name, timezone, country, is_active)
      VALUES ($1, $2, $3, $4, 'ES', true)
      ON CONFLICT DO NOTHING
      RETURNING id, latitude, longitude, location_name, city, region, country, timezone, climate_zone
    `, [latitude, longitude, locationName || 'Nueva ubicación', timezone]);

    if (result.rows.length === 0) {
      const existing = await pool.query(`
        SELECT id, latitude, longitude, location_name, city, region, country, timezone, climate_zone
        FROM weather_locations
        WHERE ROUND(latitude::NUMERIC, 3) = $1 AND ROUND(longitude::NUMERIC, 3) = $2
      `, [Math.round(latitude * 1000) / 1000, Math.round(longitude * 1000) / 1000]);
      
      const row = existing.rows[0];
      return {
        id: row.id,
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        locationName: row.location_name,
        city: row.city,
        region: row.region,
        country: row.country,
        timezone: row.timezone,
        climateZone: row.climate_zone
      };
    }

    const row = result.rows[0];
    return {
      id: row.id,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      locationName: row.location_name,
      city: row.city,
      region: row.region,
      country: row.country,
      timezone: row.timezone,
      climateZone: row.climate_zone
    };
  }

  private estimateTimezone(latitude: number, longitude: number): string {
    if (longitude >= -4 && longitude < 2) {
      return 'Europe/Madrid';
    }
    return 'Europe/Madrid';
  }

  async getWeatherForecast(locationId: string, days: number = 14): Promise<WeatherData[]> {
    const location = await this.getLocationById(locationId);
    if (!location) {
      throw new Error('Location not found');
    }

    return this.openMeteoClient.getForecast(
      location.latitude,
      location.longitude,
      location.timezone
    );
  }

  async getGardenWeather(gardenId: string): Promise<GardenWeather> {
    const pool = await this.pool;
    const gardenResult = await pool.query(`
      SELECT g.id, g.name, g.location_latitude, g.location_longitude, g.weather_location_id,
             wl.id as location_id, wl.latitude as loc_lat, wl.longitude as loc_lon,
             wl.location_name, wl.city, wl.region, wl.country, wl.timezone, wl.climate_zone
      FROM gardens g
      LEFT JOIN weather_locations wl ON wl.id = g.weather_location_id
      WHERE g.id = $1
    `, [gardenId]);

    if (gardenResult.rows.length === 0) {
      throw new Error('Garden not found');
    }

    const garden = gardenResult.rows[0];
    let location: WeatherLocation;

    const gardenLat = parseFloat(garden.location_latitude);
    const gardenLon = parseFloat(garden.location_longitude);
    const isValidCoords = !isNaN(gardenLat) && !isNaN(gardenLon) && 
                       gardenLat >= -90 && gardenLat <= 90 && 
                       gardenLon >= -180 && gardenLon <= 180;

    if (garden.weather_location_id && garden.loc_lat && garden.loc_lon && !isNaN(parseFloat(garden.loc_lat))) {
      location = {
        id: garden.location_id,
        latitude: parseFloat(garden.loc_lat),
        longitude: parseFloat(garden.loc_lon),
        locationName: garden.location_name,
        city: garden.city,
        region: garden.region,
        country: garden.country,
        timezone: garden.timezone,
        climateZone: garden.climate_zone
      };
    } else if (isValidCoords) {
      location = await this.getOrCreateLocation(gardenLat, gardenLon, garden.name);

      await pool.query(`
        UPDATE gardens SET weather_location_id = $1 WHERE id = $2
      `, [location.id, gardenId]);
    } else if (garden.location_city) {
      const geocoded = await this.nominatimClient.geocode(
        garden.location_city,
        garden.location_region || undefined,
        garden.location_country || 'ES'
      );

      if (geocoded) {
        location = await this.getOrCreateLocation(
          geocoded.latitude,
          geocoded.longitude,
          garden.name
        );

        await pool.query(`
          UPDATE gardens SET 
            weather_location_id = $1,
            location_latitude = $2,
            location_longitude = $3
          WHERE id = $4
        `, [location.id, geocoded.latitude, geocoded.longitude, gardenId]);
      } else {
        throw new Error('Garden location city not found. Please update with a valid city.');
      }
    } else {
      throw new Error('Garden does not have valid coordinates for weather');
    }

    const forecast = await this.openMeteoClient.getForecast(
      location.latitude,
      location.longitude,
      location.timezone
    );

    const recommendation = this.calculateIrrigationRecommendation(forecast);

    return {
      gardenId: garden.id,
      gardenName: garden.name,
      location,
      forecast,
      irrigationRecommendation: recommendation.message
    };
  }

  async syncWeatherData(locationId: string): Promise<void> {
    const pool = await this.pool;
    const location = await this.getLocationById(locationId);
    if (!location) {
      throw new Error('Location not found');
    }

    const forecast = await this.openMeteoClient.getForecast(
      location.latitude,
      location.longitude,
      location.timezone
    );

    for (const data of forecast) {
      await pool.query(`
        INSERT INTO weather_daily (
          weather_location_id, weather_date, data_type, forecast_generated_at, days_ahead,
          temp_max_c, temp_min_c, temp_avg_c,
          precipitation_probability, precipitation_sum,
          weather_code, wind_speed_max, relative_humidity_max, relative_humidity_min,
          et0_fao_evapotranspiration
        ) VALUES ($1, $2, 'forecast', NOW(), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (weather_location_id, weather_date, data_type) DO UPDATE SET
          temp_max_c = $4, temp_min_c = $5, temp_avg_c = $6,
          precipitation_probability = $7, precipitation_sum = $8,
          weather_code = $9, wind_speed_max = $10,
          relative_humidity_max = $11, relative_humidity_min = $12,
          et0_fao_evapotranspiration = $13
      `, [
        locationId,
        data.date,
        forecast.indexOf(data),
        data.tempMax,
        data.tempMin,
        data.tempAvg,
        data.precipitationProbability,
        data.precipitationSum,
        data.weatherCode,
        data.windSpeedMax,
        data.humidityMax,
        data.humidityMin,
        data.et0
      ]);
    }

    logger.info(`Weather data synced for location ${locationId}`, 'WeatherService');
  }

  private async getLocationById(id: string): Promise<WeatherLocation | null> {
    const pool = await this.pool;
    const result = await pool.query(`
      SELECT id, latitude, longitude, location_name, city, region, country, timezone, climate_zone
      FROM weather_locations WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      locationName: row.location_name,
      city: row.city,
      region: row.region,
      country: row.country,
      timezone: row.timezone,
      climateZone: row.climate_zone
    };
  }

  calculateIrrigationRecommendation(forecast: WeatherData[]): IrrigationRecommendation {
    const next3Days = forecast.slice(0, 3);
    const totalPrecipitation = next3Days.reduce((sum, day) => sum + day.precipitationSum, 0);
    const avgProbability = next3Days.reduce((sum, day) => sum + day.precipitationProbability, 0) / 3;
    const avgEt0 = next3Days.reduce((sum, day) => sum + day.et0, 0) / 3;

    if (totalPrecipitation > 15 || avgProbability > 70) {
      return {
        status: 'skip',
        message: 'No requiere riego - Probabilidad alta de lluvia en los próximos días',
        reason: `Precipitación esperada: ${totalPrecipitation.toFixed(1)}mm, Probabilidad: ${avgProbability.toFixed(0)}%`,
        suggestedAmountMm: 0
      };
    }

    if (totalPrecipitation > 5 || avgProbability > 40) {
      return {
        status: 'reduce',
        message: 'Reducir riego - Lluvia esperada en los próximos días',
        reason: `Precipitación esperada: ${totalPrecipitation.toFixed(1)}mm, Probabilidad: ${avgProbability.toFixed(0)}%`,
        suggestedAmountMm: Math.max(0, avgEt0 * 0.5)
      };
    }

    if (avgEt0 > 5) {
      return {
        status: 'increase',
        message: 'Aumentar riego - Alta evapotranspiración prevista',
        reason: `ET0 promedio: ${avgEt0.toFixed(1)}mm/día`,
        suggestedAmountMm: avgEt0 * 1.2
      };
    }

    return {
      status: 'normal',
      message: 'Riego normal - Condiciones climáticas habituales',
      reason: `ET0 promedio: ${avgEt0.toFixed(1)}mm/día`,
      suggestedAmountMm: avgEt0
    };
  }
}