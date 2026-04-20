import { Query } from '../../Shared/domain/Query';

export class GetTodayLunarQuery extends Query {
  constructor(readonly hemisphere: string = 'northern') {
    super();
  }
}

export class GetLunarRecommendationsQuery extends Query {
  constructor(
    readonly taskId: string = '',
    readonly taskType: string,
    readonly hemisphere: string = 'northern'
  ) {
    super();
  }
}

export class GetMonthlyLunarCalendarQuery extends Query {
  constructor(
    readonly year: number,
    readonly month: number,
    readonly hemisphere: string = 'northern'
  ) {
    super();
  }
}

export class GetLunarTaskRecommendationsQuery extends Query {
  constructor(readonly taskId: string) {
    super();
  }
}

export class GetLunarTaskStatisticsQuery extends Query {
  constructor() {
    super();
  }
}