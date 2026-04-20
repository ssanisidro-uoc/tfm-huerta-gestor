import { QueryHandler } from '../../Shared/domain/QueryHandler';
import { Query } from '../../Shared/domain/Query';
import { GetTodayLunarQuery, GetLunarRecommendationsQuery, GetMonthlyLunarCalendarQuery } from './LunarQueries';
import { LunarService } from './LunarService';
import { LunarMonthlyCalendarService } from './LunarMonthlyCalendarService';

export class GetTodayLunarQueryHandler implements QueryHandler<GetTodayLunarQuery, any> {
  constructor(private service: LunarService) {}

  subscribedTo(): Query {
    return GetTodayLunarQuery;
  }

  async handle(query: GetTodayLunarQuery): Promise<any> {
    return this.service.getTodayLunar(query.hemisphere);
  }
}

export class GetLunarRecommendationsQueryHandler implements QueryHandler<GetLunarRecommendationsQuery, any> {
  constructor(private service: LunarService) {}

  subscribedTo(): Query {
    return GetLunarRecommendationsQuery;
  }

  async handle(query: GetLunarRecommendationsQuery): Promise<any> {
    return this.service.getRecommendationsForTask(query.taskId, query.taskType, query.hemisphere);
  }
}

export class GetMonthlyLunarCalendarQueryHandler implements QueryHandler<GetMonthlyLunarCalendarQuery, any> {
  constructor(private service: LunarMonthlyCalendarService) {}

  subscribedTo(): Query {
    return GetMonthlyLunarCalendarQuery;
  }

  async handle(query: GetMonthlyLunarCalendarQuery): Promise<any> {
    return this.service.getCalendar(query.year, query.month, query.hemisphere);
  }
}