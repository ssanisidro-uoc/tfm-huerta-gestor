import { Query } from '../../../Shared/domain/Query';

export class CheckDuplicateCropQuery extends Query {
  constructor(
    public readonly name: string,
    public readonly scientificName?: string,
    public readonly excludeId?: string
  ) {
    super();
  }
}
