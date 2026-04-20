import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindCropCompatibilitiesQuery } from './FindCropCompatibilitiesQuery';
import { CropCompatibilityRepository } from '../../domain/CropCompatibilityRepository';

export interface CropCompatibilityResponse {
  companions: any[];
  incompatibilities: any[];
}

export class FindCropCompatibilitiesQueryHandler implements QueryHandler<FindCropCompatibilitiesQuery, CropCompatibilityResponse> {
  constructor(private repository: CropCompatibilityRepository) {}

  subscribedTo(): Query {
    return FindCropCompatibilitiesQuery;
  }

  async handle(query: FindCropCompatibilitiesQuery): Promise<CropCompatibilityResponse> {
    const { type, crop_catalog_id } = query;

    let companions = [];
    let incompatibilities = [];

    if (type === 'companions' || type === 'all' || !type) {
      const comps = await this.repository.find_companions(crop_catalog_id);
      companions = comps.map(c => c.to_response());
    }

    if (type === 'incompatible' || type === 'all' || !type) {
      const incomps = await this.repository.find_incompatibilities(crop_catalog_id);
      incompatibilities = incomps.map(c => c.to_response());
    }

    return { companions, incompatibilities };
  }
}