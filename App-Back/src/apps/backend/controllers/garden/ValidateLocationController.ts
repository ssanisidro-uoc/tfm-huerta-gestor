import { NextFunction, Request, Response } from 'express';
import { NominatimClient } from '../../../../Contexts/Shared/infrastructure/NominatimClient';

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
}