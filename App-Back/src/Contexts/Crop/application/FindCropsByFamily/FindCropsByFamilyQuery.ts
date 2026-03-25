import { Query } from '../../../Shared/domain/Query';

export class FindCropsByFamilyQuery implements Query {
  constructor(readonly family: string) {}
}
