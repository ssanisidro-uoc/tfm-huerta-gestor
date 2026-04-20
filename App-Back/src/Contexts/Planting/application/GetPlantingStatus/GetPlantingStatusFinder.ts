import { PlantingByIdFinder } from '../FindPlantingById/PlantingByIdFinder';
import { CropRepository } from '../../../Crop/domain/CropRepository';
import { UserGardenRepository } from '../../../Garden/infrastructure/persistence/UserGardenRepository';
import { AppError } from '../../../Shared/domain/AppError';
import { GetPlantingStatusResponse } from './GetPlantingStatusResponse';

export class GetPlantingStatusFinder {
  constructor(
    private plantingFinder: PlantingByIdFinder,
    private cropRepository: CropRepository,
    private userGardenRepository: UserGardenRepository
  ) {}

  async run(planting_id: string, user_id: string): Promise<GetPlantingStatusResponse> {
    const planting = await this.plantingFinder.run(planting_id);
    if (!planting) {
      throw new AppError(404, 'PLANTING_NOT_FOUND', 'Planting not found');
    }

    const gardenId = planting.garden_id.get_value();
    const hasAccess = await this.userGardenRepository.has_permission(user_id, gardenId, 'viewer');
    if (!hasAccess) {
      const garden = await this.userGardenRepository.find_by_user_and_garden(user_id, gardenId);
      if (!garden) {
        throw new AppError(403, 'GARDEN_ACCESS_DENIED', 'You do not have access to this garden');
      }
    }

    const cropId = planting.crop_id.get_value();
    const crop = await this.cropRepository.search_by_id(cropId);
    if (!crop) {
      throw new AppError(404, 'CROP_NOT_FOUND', 'Crop not found');
    }

    const daysToMaturity = crop.days_to_harvest_max;
    const now = new Date();
    const plantedAt = new Date(planting.planted_at);
    const expectedHarvestAt = planting.expected_harvest_at ? new Date(planting.expected_harvest_at) : null;
    
    const daysElapsed = Math.floor((now.getTime() - plantedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate using expected_harvest_at if available, otherwise use crop days_to_harvest_max
    const totalDays = expectedHarvestAt 
      ? Math.floor((expectedHarvestAt.getTime() - plantedAt.getTime()) / (1000 * 60 * 60 * 24))
      : daysToMaturity;
    
    const daysToHarvest = expectedHarvestAt
      ? Math.max(0, Math.floor((expectedHarvestAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : Math.max(0, daysToMaturity - daysElapsed);
    
    const progress = Math.min(100, Math.round((daysElapsed / totalDays) * 100));

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

    const isHarvested = (planting.status as string) === 'harvested' || (planting.status as string) === 'archived' || (planting.status as string) === 'completed';

    const harvestInfo = planting.total_harvest_kg || planting.harvest_quality || planting.harvest_notes
      ? {
          total_harvest_kg: planting.total_harvest_kg ?? undefined,
          harvest_quality: planting.harvest_quality ?? undefined,
          harvest_notes: planting.harvest_notes ?? undefined
        }
      : undefined;

    return new GetPlantingStatusResponse(
      planting.id.get_value(),
      {
        id: crop.id.get_value(),
        name: crop.name.get_value(),
        days_to_maturity: daysToMaturity
      },
      planting.planted_at,
      planting.expected_harvest_at,
      planting.status,
      planting.harvested_at,
      harvestInfo,
      isHarvested ? undefined : {
        phase,
        progress,
        description,
        days_elapsed: daysElapsed,
        days_to_harvest: daysToHarvest,
        days_until_harvest_text: daysUntilHarvestText
      },
      isHarvested ? undefined : actions
    );
  }
}
