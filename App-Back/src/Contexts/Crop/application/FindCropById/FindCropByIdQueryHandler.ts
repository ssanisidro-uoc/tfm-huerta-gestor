import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindCropByIdQuery } from './FindCropByIdQuery';
import { FindCropByIdResponse } from './FindCropByIdResponse';
import { CropByIdFinder } from './CropByIdFinder';

export class FindCropByIdQueryHandler implements QueryHandler<FindCropByIdQuery, FindCropByIdResponse> {
  constructor(private finder: CropByIdFinder) {}

  subscribedTo(): Query {
    return FindCropByIdQuery;
  }

  async handle(query: FindCropByIdQuery): Promise<FindCropByIdResponse> {
    const crop = await this.finder.run(query.id);
    if (!crop) {
      throw new Error(`Crop with id ${query.id} not found`);
    }
    return new FindCropByIdResponse(
      crop.id.get_value(),
      crop.name.get_value(),
      crop.scientific_name,
      crop.family,
      crop.category,
      crop.lifecycle,
      crop.growth_habit,
      crop.days_to_harvest_min,
      crop.days_to_harvest_max,
      crop.days_to_germination,
      crop.min_temperature_c,
      crop.max_temperature_c,
      crop.optimal_temperature_min_c,
      crop.optimal_temperature_max_c,
      crop.frost_tolerant,
      crop.heat_tolerant,
      crop.sun_requirement,
      crop.min_sun_hours,
      crop.shade_tolerance,
      crop.preferred_soil_types,
      crop.min_soil_ph,
      crop.max_soil_ph,
      crop.soil_depth_requirement,
      crop.soil_fertility_requirement,
      crop.water_requirement,
      crop.drought_tolerant,
      crop.waterlogging_tolerant,
      crop.recommended_spacing_cm,
      crop.recommended_row_spacing_cm,
      crop.seed_depth_cm,
      crop.sowing_start_month,
      crop.sowing_end_month,
      crop.harvest_start_month,
      crop.harvest_end_month,
      crop.companion_crops,
      crop.incompatible_crops,
      crop.rotation_group,
      crop.years_before_replant,
      crop.common_pests,
      crop.common_diseases,
      crop.pest_resistance_level,
      crop.nitrogen_fixer,
      crop.attracts_pollinators,
      crop.attracts_beneficial_insects,
      crop.average_yield_kg_per_m2,
      crop.harvest_type,
      crop.preferred_moon_phase,
      crop.biodynamic_type,
      crop.description,
      crop.growing_tips,
      crop.culinary_uses,
      crop.nutritional_info
    );
  }
}
