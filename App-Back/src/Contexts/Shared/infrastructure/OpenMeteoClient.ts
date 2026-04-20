import { logger } from './Logger';

export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    precipitation_sum: number[];
    weather_code: number[];
    wind_speed_10m_max: number[];
    relative_humidity_2m_max: number[];
    relative_humidity_2m_min: number[];
    et0_fao_evapotranspiration: number[];
  };
  daily_units: {
    time: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    precipitation_probability_max: string;
    precipitation_sum: string;
    weather_code: string;
    wind_speed_10m_max: string;
    relative_humidity_2m_max: string;
    relative_humidity_2m_min: string;
    et0_fao_evapotranspiration: string;
  };
}

export interface OpenMeteoHistoricalResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    weather_code: number[];
    et0_fao_evapotranspiration: number[];
  };
}

export interface WeatherData {
  date: string;
  tempMax: number;
  tempMin: number;
  tempAvg: number;
  precipitationProbability: number;
  precipitationSum: number;
  weatherCode: number;
  weatherDescription: string;
  windSpeedMax: number;
  humidityMax: number;
  humidityMin: number;
  et0: number;
}

const WEATHER_CODES: Record<number, string> = {
  0: 'Despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla convectiva',
  51: 'Llovizna ligera',
  53: 'Llovizna moderada',
  55: 'Llovizna densa',
  56: 'Llovizna ligera congelante',
  57: 'Llovizna densa congelante',
  61: 'Lluvia ligera',
  63: 'Lluvia moderada',
  65: 'Lluvia intensa',
  66: 'Lluvia ligera congelante',
  67: 'Lluvia intensa congelante',
  71: 'Nieve ligera',
  73: 'Nieve moderada',
  75: 'Nieve intensa',
  77: 'Granos de nieve',
  80: 'Chubascos ligeros',
  81: 'Chubascos moderados',
  82: 'Chubascos intensos',
  85: 'Chubascos de nieve ligeros',
  86: 'Chubascos de nieve intensos',
  95: 'Tormenta',
  96: 'Tormenta con granizo ligero',
  99: 'Tormenta con granizo intenso'
};

export class OpenMeteoClient {
  private readonly baseUrl = 'https://api.open-meteo.com/v1';
  private readonly forecastDays = 14;

  async getForecast(
    latitude: number,
    longitude: number,
    timezone: string = 'Europe/Madrid'
  ): Promise<WeatherData[]> {
    const url = this.buildForecastUrl(latitude, longitude, timezone);
    
    try {
      logger.debug(`Fetching weather forecast: ${url}`, 'OpenMeteoClient');
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
      }
      
      const data = (await response.json()) as OpenMeteoForecastResponse;
      return this.mapForecastData(data);
    } catch (error: any) {
      logger.error(`Weather API error: ${error.message}`, 'OpenMeteoClient');
      throw error;
    }
  }

  private buildForecastUrl(latitude: number, longitude: number, timezone: string): string {
    const params = new URLSearchParams({
      latitude: latitude.toFixed(4),
      longitude: longitude.toFixed(4),
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_probability_max',
        'precipitation_sum',
        'weather_code',
        'wind_speed_10m_max',
        'relative_humidity_2m_max',
        'relative_humidity_2m_min',
        'et0_fao_evapotranspiration'
      ].join(','),
      timezone,
      forecast: this.forecastDays.toString()
    });

    return `${this.baseUrl}/forecast?${params.toString()}`;
  }

  private mapForecastData(data: OpenMeteoForecastResponse): WeatherData[] {
    const { daily } = data;
    const results: WeatherData[] = [];

    for (let i = 0; i < daily.time.length; i++) {
      const tempMax = daily.temperature_2m_max[i];
      const tempMin = daily.temperature_2m_min[i];
      
      results.push({
        date: daily.time[i],
        tempMax: Math.round(tempMax * 10) / 10,
        tempMin: Math.round(tempMin * 10) / 10,
        tempAvg: Math.round(((tempMax + tempMin) / 2) * 10) / 10,
        precipitationProbability: daily.precipitation_probability_max[i] ?? 0,
        precipitationSum: daily.precipitation_sum[i] ?? 0,
        weatherCode: daily.weather_code[i] ?? 0,
        weatherDescription: WEATHER_CODES[daily.weather_code[i] ?? 0] || 'Desconocido',
        windSpeedMax: daily.wind_speed_10m_max[i] ?? 0,
        humidityMax: daily.relative_humidity_2m_max[i] ?? 0,
        humidityMin: daily.relative_humidity_2m_min[i] ?? 0,
        et0: daily.et0_fao_evapotranspiration[i] ?? 0
      });
    }

    return results;
  }

  static getWeatherDescription(code: number): string {
    return WEATHER_CODES[code] || 'Desconocido';
  }

  static isRainy(code: number): boolean {
    return [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code);
  }

  static isStormy(code: number): boolean {
    return [95, 96, 99].includes(code);
  }

  static isSnowy(code: number): boolean {
    return [71, 73, 75, 77, 85, 86].includes(code);
  }

  static isWindy(code: number, windSpeed: number): boolean {
    return windSpeed > 40;
  }
}