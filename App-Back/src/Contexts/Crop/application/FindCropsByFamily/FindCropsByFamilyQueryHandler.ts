import { Query } from '../../../Shared/domain/Query';
import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { CropsByFamilyFinder } from './CropsByFamilyFinder';
import { FindCropsByFamilyQuery } from './FindCropsByFamilyQuery';
import { FindCropsByFamilyResponse } from './FindCropsByFamilyResponse';

export class FindCropsByFamilyQueryHandler implements QueryHandler<
  FindCropsByFamilyQuery,
  FindCropsByFamilyResponse
> {
  constructor(private finder: CropsByFamilyFinder) {}

  subscribedTo(): Query {
    return FindCropsByFamilyQuery;
  }

  async handle(query: FindCropsByFamilyQuery): Promise<FindCropsByFamilyResponse> {
    const crops = await this.finder.run(query.family);

    return new FindCropsByFamilyResponse(
      crops.map((crop) => ({
        id: crop.id.get_value(),
        name: crop.name.get_value(),
        scientific_name: crop.scientific_name,
        family: crop.family,
        days_to_maturity: crop.days_to_maturity
      }))
    );
  }
}
