import { LunarAgriculturalRule } from './LunarAgriculturalRule/LunarAgriculturalRule';

export interface LunarAgriculturalRuleRepository {
  findById(id: string): Promise<LunarAgriculturalRule | null>;
  findByMoonPhase(moonPhase: string): Promise<LunarAgriculturalRule[]>;
  findByZodiacSign(zodiacSign: string): Promise<LunarAgriculturalRule[]>;
  findByBiodynamicDay(dayType: string): Promise<LunarAgriculturalRule[]>;
  findByActionAndCropPart(action: string, cropPart?: string): Promise<LunarAgriculturalRule[]>;
  findByDateAndAction(date: Date, action: string, hemisphere: string): Promise<LunarAgriculturalRule[]>;
  search(criteria: Partial<SearchCriteria>): Promise<LunarAgriculturalRule[]>;
  save(rule: LunarAgriculturalRule): Promise<void>;
  saveMany(rules: LunarAgriculturalRule[]): Promise<void>;
  count(): Promise<number>;
}

export interface SearchCriteria {
  moonPhase?: string;
  zodiacSign?: string;
  zodiacElement?: string;
  biodynamicDayType?: string;
  agriculturalAction?: string;
  cropCategory?: string;
  recommendationType?: string;
  isActive?: boolean;
}