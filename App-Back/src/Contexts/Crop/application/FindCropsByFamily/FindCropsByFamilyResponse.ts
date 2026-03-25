import { Response } from '../../../Shared/domain/Response';

export class FindCropsByFamilyResponse implements Response {
  constructor(
    readonly crops: Array<{
      id: string;
      name: string;
      scientific_name: string;
      family: string;
      days_to_maturity: number;
    }>
  ) {}
}
