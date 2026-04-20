import { AggregateRoot } from '../../../Shared/domain/AggregateRoot';

export interface LunarCalendarProps {
  id?: string;
  calendarDate: Date;
  hemisphere: string;
  moonPhase: string;
  moonPhasePrecise?: number;
  illuminationPercent: number;
  moonAgeDays: number;
  isNewMoon: boolean;
  isFullMoon: boolean;
  isFirstQuarter: boolean;
  isLastQuarter: boolean;
  isSupermoon: boolean;
  isBlueMoon: boolean;
  isEclipse: boolean;
  eclipseType?: string;
  lunarDistanceKm?: number;
  isPerigee: boolean;
  isApogee: boolean;
  perigeeEffectStrength?: number;
  zodiacSign?: string;
  zodiacElement?: string;
  biodynamicDayType?: string;
  biodynamicQuality?: string;
  moonriseTime?: string;
  moonsetTime?: string;
  moonCulminationTime?: string;
  isActive: boolean;
}

export class LunarCalendar extends AggregateRoot {
  readonly id: string;
  readonly calendarDate: Date;
  readonly hemisphere: string;
  readonly moonPhase: string;
  readonly moonPhasePrecise: number;
  readonly illuminationPercent: number;
  readonly moonAgeDays: number;
  readonly isNewMoon: boolean;
  readonly isFullMoon: boolean;
  readonly isFirstQuarter: boolean;
  readonly isLastQuarter: boolean;
  readonly isSupermoon: boolean;
  readonly isBlueMoon: boolean;
  readonly isEclipse: boolean;
  readonly eclipseType: string;
  readonly lunarDistanceKm: number;
  readonly isPerigee: boolean;
  readonly isApogee: boolean;
  readonly perigeeEffectStrength: number;
  readonly zodiacSign: string;
  readonly zodiacElement: string;
  readonly biodynamicDayType: string;
  readonly biodynamicQuality: string;
  readonly moonriseTime: string;
  readonly moonsetTime: string;
  readonly moonCulminationTime: string;

  constructor(props: LunarCalendarProps) {
    super();
    this.id = props.id || crypto.randomUUID();
    this.calendarDate = props.calendarDate;
    this.hemisphere = props.hemisphere || 'northern';
    this.moonPhase = props.moonPhase;
    this.moonPhasePrecise = props.moonPhasePrecise || 0;
    this.illuminationPercent = props.illuminationPercent;
    this.moonAgeDays = props.moonAgeDays;
    this.isNewMoon = props.isNewMoon;
    this.isFullMoon = props.isFullMoon;
    this.isFirstQuarter = props.isFirstQuarter;
    this.isLastQuarter = props.isLastQuarter;
    this.isSupermoon = props.isSupermoon || false;
    this.isBlueMoon = props.isBlueMoon || false;
    this.isEclipse = props.isEclipse || false;
    this.eclipseType = props.eclipseType || '';
    this.lunarDistanceKm = props.lunarDistanceKm || 384400;
    this.isPerigee = props.isPerigee || false;
    this.isApogee = props.isApogee || false;
    this.perigeeEffectStrength = props.perigeeEffectStrength || 0;
    this.zodiacSign = props.zodiacSign || '';
    this.zodiacElement = props.zodiacElement || '';
    this.biodynamicDayType = props.biodynamicDayType || '';
    this.biodynamicQuality = props.biodynamicQuality || 'neutral';
    this.moonriseTime = props.moonriseTime || '';
    this.moonsetTime = props.moonsetTime || '';
    this.moonCulminationTime = props.moonCulminationTime || '';
  }

  static readonly MOON_PHASES = {
    NEW_MOON: 'new_moon',
    WAXING_CRESCENT: 'waxing_crescent',
    FIRST_QUARTER: 'first_quarter',
    WAXING_GIBBOUS: 'waxing_gibbous',
    FULL_MOON: 'full_moon',
    WANING_GIBBOUS: 'waning_gibbous',
    LAST_QUARTER: 'last_quarter',
    WANING_CRESCENT: 'waning_crescent'
  };

  static readonly BIODYNAMIC_DAYS = {
    ROOT_DAY: 'root',
    LEAF_DAY: 'leaf',
    FLOWER_DAY: 'flower',
    FRUIT_DAY: 'fruit'
  };

  static readonly ZODIAC_ELEMENTS = {
    FIRE: 'fire',
    WATER: 'water',
    EARTH: 'earth',
    AIR: 'air'
  };

  static readonly HEMISPHERES = {
    NORTHERN: 'northern',
    SOUTHERN: 'southern'
  };

  isWaxing(): boolean {
    return this.isNewMoon || this.isFirstQuarter || this.moonPhasePrecise < 0.5;
  }

  isOptimalForSowing(): boolean {
    return this.isWaxing() && !this.isFullMoon;
  }

  isOptimalForHarvesting(): boolean {
    return this.isFullMoon;
  }

  isRootDay(): boolean {
    return this.biodynamicDayType === 'root';
  }

  isLeafDay(): boolean {
    return this.biodynamicDayType === 'leaf';
  }

  isFlowerDay(): boolean {
    return this.biodynamicDayType === 'flower';
  }

  isFruitDay(): boolean {
    return this.biodynamicDayType === 'fruit';
  }

  getPhaseEmoji(): string {
    const phaseMap: Record<string, string> = {
      'new_moon': '🌑',
      'waxing_crescent': '🌒',
      'first_quarter': '🌓',
      'waxing_gibbous': '🌔',
      'full_moon': '🌕',
      'waning_gibbous': '🌖',
      'last_quarter': '🌗',
      'waning_crescent': '🌘'
    };
    return phaseMap[this.moonPhase] || '🌙';
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      calendar_date: this.calendarDate,
      hemisphere: this.hemisphere,
      moon_phase: this.moonPhase,
      moon_phase_precise: this.moonPhasePrecise,
      illumination_percent: this.illuminationPercent,
      moon_age_days: this.moonAgeDays,
      is_new_moon: this.isNewMoon,
      is_full_moon: this.isFullMoon,
      is_first_quarter: this.isFirstQuarter,
      is_last_quarter: this.isLastQuarter,
      is_supermoon: this.isSupermoon,
      is_eclipse: this.isEclipse,
      is_perigee: this.isPerigee,
      is_apogee: this.isApogee,
      zodiac_sign: this.zodiacSign,
      zodiac_element: this.zodiacElement,
      biodynamic_day_type: this.biodynamicDayType,
      biodynamic_quality: this.biodynamicQuality,
      moon_phase_emoji: this.getPhaseEmoji()
    };
  }
}