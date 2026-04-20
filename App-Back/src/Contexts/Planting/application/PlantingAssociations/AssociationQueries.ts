import { Query } from '../../../Shared/domain/Query';

export class GetAssociationsByPlantingQuery extends Query {
  constructor(readonly plantingId: string) {
    super();
  }
}

export class GetAssociationsByPlotQuery extends Query {
  constructor(readonly plotId: string) {
    super();
  }
}

export class GetAssociationByIdQuery extends Query {
  constructor(readonly id: string) {
    super();
  }
}

export class GetCompanionSuggestionsQuery extends Query {
  constructor(readonly plotId: string, readonly cropCatalogId: string) {
    super();
  }
}

export class GetActivePlantingsQuery extends Query {
  constructor(readonly plotId: string) {
    super();
  }
}