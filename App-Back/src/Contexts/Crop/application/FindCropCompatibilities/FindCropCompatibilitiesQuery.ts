import { Query } from '../../../Shared/domain/Query';

export class FindCropCompatibilitiesQuery extends Query {
  constructor(
    readonly crop_catalog_id: string,
    readonly type?: 'companions' | 'incompatible' | 'all'
  ) {
    super();
  }
}