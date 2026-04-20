import { LunarCalendar } from './LunarCalendar/LunarCalendar';

export interface LunarCalendarRepository {
  findByDate(date: Date, hemisphere: string): Promise<LunarCalendar | null>;
  findByDateRange(startDate: Date, endDate: Date, hemisphere: string): Promise<LunarCalendar[]>;
  findByMonth(year: number, month: number, hemisphere: string): Promise<LunarCalendar[]>;
  search(criteria: Partial<SearchCriteria>): Promise<LunarCalendar[]>;
  save(calendar: LunarCalendar): Promise<void>;
  saveMany(calendars: LunarCalendar[]): Promise<void>;
  getNextNewMoon(afterDate: Date, hemisphere: string): Promise<LunarCalendar | null>;
  getNextFullMoon(afterDate: Date, hemisphere: string): Promise<LunarCalendar | null>;
  count(): Promise<number>;
}

export interface SearchCriteria {
  hemisphere: string;
  moonPhase?: string;
  biodynamicDayType?: string;
  zodiacSign?: string;
  zodiacElement?: string;
  isPerigee?: boolean;
  isApogee?: boolean;
  isNewMoon?: boolean;
  isFullMoon?: boolean;
}