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
      crop.days_to_maturity,
      crop.min_temperature,
      crop.max_temperature
    );
  }
}
