import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindAllCropsQuery } from './FindAllCropsQuery';
import { FindAllCropsResponse } from './FindAllCropsResponse';
import { AllCropsFinder } from './AllCropsFinder';

export class FindAllCropsQueryHandler implements QueryHandler<FindAllCropsQuery, FindAllCropsResponse> {
  constructor(private finder: AllCropsFinder) {}

  subscribedTo(): Query {
    return FindAllCropsQuery;
  }

  async handle(query: FindAllCropsQuery): Promise<FindAllCropsResponse> {
    const { crops, total } = await this.finder.run(query.page, query.limit, query.filters);
    
    return new FindAllCropsResponse(
      crops.map(crop => ({
        id: crop.id.get_value(),
        name: crop.name.get_value(),
        scientific_name: crop.scientific_name,
        family: crop.family,
        days_to_maturity: crop.days_to_maturity
      })),
      total,
      query.page,
      query.limit
    );
  }
}
