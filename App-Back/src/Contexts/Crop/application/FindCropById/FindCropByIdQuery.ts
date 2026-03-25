import { Query } from '../../../Shared/domain/Query';

export class FindCropByIdQuery implements Query {
  constructor(readonly id: string) {}
}
