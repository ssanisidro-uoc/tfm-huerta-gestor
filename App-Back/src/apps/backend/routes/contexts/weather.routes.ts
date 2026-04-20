import { Router } from 'express';
import container from '../../dependency-injection';
import { require_auth } from '../../middleware/auth.middleware';
import { GetWeatherForecastController } from '../../controllers/weather/GetWeatherForecastController';
import { GetGardenWeatherController } from '../../controllers/weather/GetGardenWeatherController';
import { GetWeatherLocationsController } from '../../controllers/weather/GetWeatherLocationsController';
import { SyncWeatherController } from '../../controllers/weather/SyncWeatherController';
import { GetWeatherRecommendationsController } from '../../controllers/weather/GetWeatherRecommendationsController';
import { WeatherAlertsController } from '../../controllers/weather/WeatherAlertsController';
import { WeatherObservationsController } from '../../controllers/weather/WeatherObservationsController';

export async function register_weather_routes(router: Router): Promise<void> {
  const forecastController = await container.get('Backend.Weather.controllers.GetWeatherForecastController') as GetWeatherForecastController;
  const gardenWeatherController = await container.get('Backend.Weather.controllers.GetGardenWeatherController') as GetGardenWeatherController;
  const locationsController = await container.get('Backend.Weather.controllers.GetWeatherLocationsController') as GetWeatherLocationsController;
  const syncController = await container.get('Backend.Weather.controllers.SyncWeatherController') as SyncWeatherController;
  const recommendationsController = await container.get('Backend.Weather.controllers.GetWeatherRecommendationsController') as GetWeatherRecommendationsController;
  const alertsController = await container.get('Backend.Weather.controllers.WeatherAlertsController') as WeatherAlertsController;
  const observationsController = await container.get('Backend.Weather.controllers.WeatherObservationsController') as WeatherObservationsController;

  router.get('/api/weather/locations', require_auth, (req, res, next) => locationsController.run(req, res, next));
  router.get('/api/weather/forecast/:location_id', require_auth, (req, res, next) => forecastController.run(req, res, next));
  router.get('/api/weather/garden/:garden_id', require_auth, (req, res, next) => gardenWeatherController.run(req, res, next));
  router.post('/api/weather/sync/:location_id', require_auth, (req, res, next) => syncController.run(req, res, next));
  
  router.get('/api/weather/garden/:gardenId/recommendations', require_auth, (req, res, next) => recommendationsController.getRecommendations(req, res, next));
  router.get('/api/weather/garden/:gardenId/alerts', require_auth, (req, res, next) => recommendationsController.getAlerts(req, res, next));

  router.get('/api/weather/alerts/:gardenId', require_auth, (req, res, next) => alertsController.getByGarden(req, res, next));
  router.get('/api/weather/alerts/:gardenId/active', require_auth, (req, res, next) => alertsController.getActive(req, res, next));
  router.patch('/api/weather/alerts/:alertId/acknowledge', require_auth, (req, res, next) => alertsController.acknowledge(req, res, next));

  router.post('/api/weather/observations', require_auth, (req, res, next) => observationsController.createObservation(req, res, next));
  router.get('/api/weather/observations/:gardenId', require_auth, (req, res, next) => observationsController.getByGarden(req, res, next));
  router.get('/api/weather/api-usage', require_auth, (req, res, next) => observationsController.getApiUsage(req, res, next));
}