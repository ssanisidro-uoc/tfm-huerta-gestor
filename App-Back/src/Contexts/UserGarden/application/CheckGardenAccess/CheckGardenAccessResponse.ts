export class CheckGardenAccessResponse {
  constructor(
    readonly hasAccess: boolean,
    readonly gardenRole: string | null
  ) {}
}
