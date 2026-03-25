export class FindCropByIdResponse {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly scientific_name: string,
    readonly family: string,
    readonly days_to_maturity: number,
    readonly min_temperature: number,
    readonly max_temperature: number
  ) {}
}
