import { NextFunction, Request, Response } from 'express';
import { NominatimClient, GeocodingResult } from '../../../../Contexts/Shared/infrastructure/NominatimClient';

export class ValidateLocationController {
  constructor(private nominatimClient: NominatimClient) {}

  async validateCity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { city, region, country } = req.query;

      if (!city || typeof city !== 'string') {
        res.status(400).json({ error: 'City is required' });
        return;
      }

      const result = await this.nominatimClient.geocode(
        city,
        typeof region === 'string' ? region : undefined,
        typeof country === 'string' ? country : 'Spain'
      );

      if (!result) {
        res.status(404).json({
          valid: false,
          error: 'Ciudad no encontrada. Verifica el nombre.'
        });
        return;
      }

      res.status(200).json({
        valid: true,
        location: {
          city: result.city,
          region: result.region,
          country: result.country,
          latitude: result.latitude,
          longitude: result.longitude,
          displayName: result.displayName
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async searchCities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, country } = req.query;

      if (!q || typeof q !== 'string' || q.length < 2) {
        res.status(400).json({ error: 'Query too short' });
        return;
      }

      const results = await this.nominatimClient.search(
        q,
        typeof country === 'string' && country.length === 2 ? country : undefined,
        5
      );

      const suggestions = results.map((r: GeocodingResult) => ({
        city: r.city,
        region: r.region,
        country: r.country,
        latitude: r.latitude,
        longitude: r.longitude,
        displayName: r.displayName
      }));

      res.status(200).json({ suggestions });
    } catch (error) {
      next(error);
    }
  }
}