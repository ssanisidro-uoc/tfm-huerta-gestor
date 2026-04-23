import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindCropCompatibilitiesQuery } from './FindCropCompatibilitiesQuery';
import { CropCompatibilityFinder, CropCompatibilityResult } from './CropCompatibilityFinder';

export interface CropCompatibilityResponse {
  companions: any[];
  incompatibilities: any[];
}

export class FindCropCompatibilitiesQueryHandler implements QueryHandler<FindCropCompatibilitiesQuery, CropCompatibilityResponse> {
  constructor(private finder: CropCompatibilityFinder) {}

  subscribedTo(): Query {
    return FindCropCompatibilitiesQuery;
  }

  async handle(query: FindCropCompatibilitiesQuery): Promise<CropCompatibilityResponse> {
    const { type, crop_catalog_id } = query;
    return this.finder.run(crop_catalog_id, type);
  }
}