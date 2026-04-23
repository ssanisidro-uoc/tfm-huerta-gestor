import { logger } from './Logger';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
  city?: string;
  region?: string;
  country: string;
}

export class NominatimClient {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';
  private delayMs = 1100;

  async geocode(
    city: string,
    region?: string,
    country: string = 'Spain'
  ): Promise<GeocodingResult | null> {
    const query = [city, region, country].filter(Boolean).join(', ');

    try {
      await this.wait();

      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '1',
        addressdetails: '1'
      });

      const url = `${this.baseUrl}/search?${params.toString()}`;
      logger.debug(`Geocoding: ${query}`, 'NominatimClient');

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Huertis/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = (await response.json()) as any[];

      if (data.length === 0) {
        logger.warn(`No geocoding results for: ${query}`, 'NominatimClient');
        return null;
      }

      const result = data[0];
      const address = result.address || {};

      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
        city: address.city || address.town || address.village || address.municipality || city,
        region: address.state || address.county || region,
        country: address.country_code?.toUpperCase() || country
      };
    } catch (error: any) {
      logger.error(`Geocoding error for ${query}: ${error.message}`, 'NominatimClient');
      return null;
    }
  }

  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<GeocodingResult | null> {
    try {
      await this.wait();

      const params = new URLSearchParams({
        lat: latitude.toFixed(6),
        lon: longitude.toFixed(6),
        format: 'json',
        addressdetails: '1'
      });

      const url = `${this.baseUrl}/reverse?${params.toString()}`;
      logger.debug(`Reverse geocoding: ${latitude}, ${longitude}`, 'NominatimClient');

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Huertis/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = await response.json();
      const address = data.address || {};

      return {
        latitude: parseFloat(data.lat),
        longitude: parseFloat(data.lon),
        displayName: data.display_name,
        city: address.city || address.town || address.village || address.municipality,
        region: address.state || address.county,
        country: address.country_code?.toUpperCase() || 'ES'
      };
    } catch (error: any) {
      logger.error(`Reverse geocoding error for ${latitude}, ${longitude}: ${error.message}`, 'NominatimClient');
      return null;
    }
  }

  async search(
    query: string,
    countryCode?: string,
    limit: number = 5
  ): Promise<GeocodingResult[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      await this.wait();

      const searchParams = new URLSearchParams({
        q: query,
        format: 'json',
        limit: limit.toString(),
        addressdetails: '1',
        'accept-language': 'es,gl,ca,en,pt,fr'
      });

      if (countryCode) {
        searchParams.set('countrycodes', countryCode.toLowerCase());
      }

      const url = `${this.baseUrl}/search?${searchParams.toString()}`;
      logger.debug(`Searching: ${query}`, 'NominatimClient');

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Huertis/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = (await response.json()) as any[];

      return data.map((item) => {
        const address = item.address || {};
        return {
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          displayName: item.display_name,
          city: address.city || address.town || address.village || address.municipality || query,
          region: address.state || address.county,
          country: address.country_code?.toUpperCase() || ''
        };
      });
    } catch (error: any) {
      logger.error(`Search error for ${query}: ${error.message}`, 'NominatimClient');
      return [];
    }
  }

  private async wait(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));
  }
}