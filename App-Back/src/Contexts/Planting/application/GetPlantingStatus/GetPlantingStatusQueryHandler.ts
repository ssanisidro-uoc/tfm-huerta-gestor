import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetPlantingStatusQuery } from './GetPlantingStatusQuery';
import { PlantingByIdFinder } from '../FindPlantingById/PlantingByIdFinder';
import { CropRepository } from '../../../Crop/domain/CropRepository';
import { UserGardenRepository } from '../../../Garden/infrastructure/persistence/UserGardenRepository';
import { AppError } from '../../../Shared/domain/AppError';

export interface PlantingStatusResponse {
  id: string;
  crop: {
    id: string;
    name: string;
    days_to_maturity: number;
  };
  planted_at: Date;
  expected_harvest_at: Date;
  status: string;
  phenological: {
    phase: string;
    progress: number;
    description: string;
    days_elapsed: number;
    days_to_harvest: number;
    days_until_harvest_text: string;
  };
  actions: string[];
}

export class GetPlantingStatusQueryHandler implements QueryHandler<GetPlantingStatusQuery, PlantingStatusResponse> {
  constructor(
    private plantingFinder: PlantingByIdFinder,
    private cropRepository: CropRepository,
    private userGardenRepository: UserGardenRepository
  ) {}

  subscribedTo(): Query {
    return GetPlantingStatusQuery;
  }

  async handle(query: GetPlantingStatusQuery): Promise<PlantingStatusResponse> {
    const planting = await this.plantingFinder.run(query.planting_id);
    if (!planting) {
      throw new AppError(404, 'PLANTING_NOT_FOUND', 'Planting not found');
    }

    const gardenId = planting.garden_id.get_value();
    const hasAccess = await this.userGardenRepository.has_permission(query.user_id, gardenId, 'viewer');
    if (!hasAccess) {
      const garden = await this.userGardenRepository.find_by_user_and_garden(query.user_id, gardenId);
      if (!garden) {
        throw new AppError(403, 'GARDEN_ACCESS_DENIED', 'You do not have access to this garden');
      }
    }

    const cropId = planting.crop_id.get_value();
    const crop = await this.cropRepository.search_by_id(cropId);
    if (!crop) {
      throw new AppError(404, 'CROP_NOT_FOUND', 'Crop not found');
    }

    const daysToMaturity = crop.days_to_maturity;
    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - new Date(planting.planted_at).getTime()) / (1000 * 60 * 60 * 24));
    const daysToHarvest = Math.max(0, daysToMaturity - daysElapsed);
    const progress = Math.min(100, Math.round((daysElapsed / daysToMaturity) * 100));

    let phase: string;
    let description: string;
    let actions: string[];

    if (progress < 10) {
      phase = 'Germinación';
      description = 'La semilla está germinando. Mantener humedad constante sin encharcar.';
      actions = ['Regar', 'Verificar humedad'];
    } else if (progress < 30) {
      phase = 'Crecimiento';
      description = 'La plántula está creciendo. Necesita luz y nutrientes.';
      actions = ['Regar', 'Fertilizar', 'Controlar plagas'];
    } else if (progress < 60) {
      phase = 'Desarrollo';
      description = 'La planta está desarrollando follaje y raíces.';
      actions = ['Regar', 'Fertilizar', 'Escardar', 'Controlar plagas'];
    } else if (progress < 80) {
      phase = 'Floración';
      description = 'La planta está floreciendo. Importante el riego regular.';
      actions = ['Regar', 'Fertilizar', 'Tratamiento fitosanitario', 'Polinizar si es necesario'];
    } else if (progress < 100) {
      phase = 'Fructificación';
      description = 'Los frutos se están formando. Controlar plagas y regular riego.';
      actions = ['Regar', 'Tratamiento fitosanitario', 'Verificar madurez'];
    } else {
      phase = 'Maduración';
      description = 'El cultivo está listo para cosechar.';
      actions = ['Cosechar'];
    }

    const daysUntilHarvestText = daysToHarvest === 0
      ? 'Listo para cosecha'
      : `${daysToHarvest} días hasta cosecha`;

    return {
      id: planting.id.get_value(),
      crop: {
        id: crop.id.get_value(),
        name: crop.name.get_value(),
        days_to_maturity: daysToMaturity
      },
      planted_at: planting.planted_at,
      expected_harvest_at: planting.expected_harvest_at,
      status: planting.status,
      phenological: {
        phase,
        progress,
        description,
        days_elapsed: daysElapsed,
        days_to_harvest: daysToHarvest,
        days_until_harvest_text: daysUntilHarvestText
      },
      actions
    };
  }
}
