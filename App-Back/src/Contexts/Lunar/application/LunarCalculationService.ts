import { Pool } from 'pg';

export interface MoonPhaseData {
  date: Date;
  hemisphere: string;
  moonPhase: string;
  moonPhasePrecise: number;
  illuminationPercent: number;
  moonAgeDays: number;
  isNewMoon: boolean;
  isFullMoon: boolean;
  isFirstQuarter: boolean;
  isLastQuarter: boolean;
  isSupermoon: boolean;
  isPerigee: boolean;
  zodiacSign: string;
  zodiacElement: string;
  biodynamicDayType: string;
  biodynamicQuality: string;
}

const SYNODIC_MONTH = 29.530588853;
const ANOMALISTIC_MONTH = 27.55455088;
const KNOWN_NEW_MOON = new Date('2024-01-11T11:57:00Z');

const ZODIAC_SIGNS = [
  { sign: 'aries', element: 'fire', start: 0, end: 30 },
  { sign: 'taurus', element: 'earth', start: 30, end: 60 },
  { sign: 'gemini', element: 'air', start: 60, end: 90 },
  { sign: 'cancer', element: 'water', start: 90, end: 120 },
  { sign: 'leo', element: 'fire', start: 120, end: 150 },
  { sign: 'virgo', element: 'earth', start: 150, end: 180 },
  { sign: 'libra', element: 'air', start: 180, end: 210 },
  { sign: 'scorpio', element: 'water', start: 210, end: 240 },
  { sign: 'sagittarius', element: 'fire', start: 240, end: 270 },
  { sign: 'capricorn', element: 'earth', start: 270, end: 300 },
  { sign: 'aquarius', element: 'air', start: 300, end: 330 },
  { sign: 'pisces', element: 'water', start: 330, end: 360 }
];

const PHASE_MAP = [
  { threshold: 0.0625, phase: 'new_moon' },
  { threshold: 0.1875, phase: 'waxing_crescent' },
  { threshold: 0.3125, phase: 'first_quarter' },
  { threshold: 0.4375, phase: 'waxing_gibbous' },
  { threshold: 0.5625, phase: 'full_moon' },
  { threshold: 0.6875, phase: 'waning_gibbous' },
  { threshold: 0.8125, phase: 'last_quarter' },
  { threshold: 0.9375, phase: 'waning_crescent' }
];

export class LunarCalculationService {
  private pool: Promise<Pool>;

  constructor(pool: Promise<Pool>) {
    this.pool = pool;
  }

  async calculateMoonPhase(date: Date, hemisphere: string = 'northern'): Promise<MoonPhaseData> {
    const moonAgeDays = this.calculateMoonAge(date);
    const moonPhasePrecise = moonAgeDays / SYNODIC_MONTH;
    const illuminationPercent = Math.round((1 - Math.cos(2 * Math.PI * moonPhasePrecise)) * 100);
    
    const moonPhase = this.getPhaseName(moonPhasePrecise);
    const zodiac = this.getZodiac(date);
    
    const isNewMoon = moonPhasePrecise < 0.0625 || moonPhasePrecise > 0.9375;
    const isFullMoon = moonPhasePrecise > 0.4375 && moonPhasePrecise < 0.5625;
    const isFirstQuarter = moonPhasePrecise > 0.1875 && moonPhasePrecise < 0.3125;
    const isLastQuarter = moonPhasePrecise > 0.6875 && moonPhasePrecise < 0.8125;

    const { biodynamicDayType, biodynamicQuality } = this.getBiodynamicData(moonPhase, zodiac.sign);

    const isSupermoon = !isNewMoon && (moonPhase === 'full_moon' || moonPhase === 'new_moon');
    const isPerigee = this.checkPerigee(date);

    return {
      date,
      hemisphere,
      moonPhase,
      moonPhasePrecise,
      illuminationPercent,
      moonAgeDays,
      isNewMoon,
      isFullMoon,
      isFirstQuarter,
      isLastQuarter,
      isSupermoon,
      isPerigee,
      zodiacSign: zodiac.sign,
      zodiacElement: zodiac.element,
      biodynamicDayType,
      biodynamicQuality
    };
  }

  calculateMoonAge(date: Date): number {
    const diffMs = date.getTime() - KNOWN_NEW_MOON.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const moonAge = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
    return Math.round(moonAge * 100) / 100;
  }

  private getPhaseName(phasePrecise: number): string {
    for (const { threshold, phase } of PHASE_MAP) {
      if (phasePrecise < threshold) return phase;
    }
    return 'new_moon';
  }

  private getZodiac(date: Date): { sign: string; element: string } {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const eclipticLongitude = (dayOfYear * 360 / 365.25) % 360;
    
    for (const { sign, element, start, end } of ZODIAC_SIGNS) {
      if (eclipticLongitude >= start && eclipticLongitude < end) {
        return { sign, element };
      }
    }
    return { sign: 'aries', element: 'fire' };
  }

  private getBiodynamicData(moonPhase: string, zodiacSign: string): { biodynamicDayType: string; biodynamicQuality: string } {
    const leafDays = ['cancer', 'scorpio', 'pisces'];
    const rootDays = ['capricorn', 'taurus', 'virgo'];
    const flowerDays = ['aries', 'leo', 'libra'];
    const fruitDays = ['gemini', 'sagittarius', 'aquarius'];
    
    let biodynamicDayType = 'root_day';
    if (leafDays.includes(zodiacSign)) biodynamicDayType = 'leaf_day';
    else if (flowerDays.includes(zodiacSign)) biodynamicDayType = 'flower_day';
    else if (fruitDays.includes(zodiacSign)) biodynamicDayType = 'fruit_day';

    let biodynamicQuality = 'neutral';
    if (moonPhase === 'new_moon' || moonPhase === 'first_quarter') {
      biodynamicQuality = 'light';
    } else if (moonPhase === 'full_moon' || moonPhase === 'last_quarter') {
      biodynamicQuality = 'heavy';
    }

    return { biodynamicDayType, biodynamicQuality };
  }

  private checkPerigee(date: Date): boolean {
    const diffMs = date.getTime() - KNOWN_NEW_MOON.getTime();
    const daysSince = diffMs / (1000 * 60 * 60 * 24);
    const anomalistic = daysSince % ANOMALISTIC_MONTH;
    return anomalistic < 3 || anomalistic > ANOMALISTIC_MONTH - 3;
  }

  async saveToDatabase(data: MoonPhaseData): Promise<void> {
    const pool = await this.pool;
    
    const query = `
      INSERT INTO lunar_calendar (
        calendar_date, hemisphere, moon_phase, moon_phase_precise,
        illumination_percent, moon_age_days, is_new_moon, is_full_moon,
        is_first_quarter, is_last_quarter, is_supermoon, is_perigee,
        zodiac_sign, zodiac_element, biodynamic_day_type, biodynamic_quality
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (calendar_date, hemisphere) DO UPDATE SET
        moon_phase = EXCLUDED.moon_phase,
        moon_phase_precise = EXCLUDED.moon_phase_precise,
        illumination_percent = EXCLUDED.illumination_percent,
        moon_age_days = EXCLUDED.moon_age_days,
        is_new_moon = EXCLUDED.is_new_moon,
        is_full_moon = EXCLUDED.is_full_moon,
        is_first_quarter = EXCLUDED.is_first_quarter,
        is_last_quarter = EXCLUDED.is_last_quarter,
        is_supermoon = EXCLUDED.is_supermoon,
        is_perigee = EXCLUDED.is_perigee,
        zodiac_sign = EXCLUDED.zodiac_sign,
        zodiac_element = EXCLUDED.zodiac_element,
        biodynamic_day_type = EXCLUDED.biodynamic_day_type,
        biodynamic_quality = EXCLUDED.biodynamic_quality
    `;

    const values = [
      data.date.toISOString().split('T')[0],
      data.hemisphere,
      data.moonPhase,
      data.moonPhasePrecise,
      data.illuminationPercent,
      data.moonAgeDays,
      data.isNewMoon,
      data.isFullMoon,
      data.isFirstQuarter,
      data.isLastQuarter,
      data.isSupermoon,
      data.isPerigee,
      data.zodiacSign,
      data.zodiacElement,
      data.biodynamicDayType,
      data.biodynamicQuality
    ];

    await pool.query(query, values);
  }

  async getByDate(date: Date, hemisphere: string = 'northern'): Promise<MoonPhaseData> {
    const pool = await this.pool;
    const dateStr = date.toISOString().split('T')[0];
    
    const query = `
      SELECT * FROM lunar_calendar 
      WHERE calendar_date = $1 AND hemisphere = $2
    `;
    
    const result = await pool.query(query, [dateStr, hemisphere]);
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        date: new Date(row.calendar_date),
        hemisphere: row.hemisphere,
        moonPhase: row.moon_phase,
        moonPhasePrecise: row.moon_phase_precise,
        illuminationPercent: row.illumination_percent,
        moonAgeDays: row.moon_age_days,
        isNewMoon: row.is_new_moon,
        isFullMoon: row.is_full_moon,
        isFirstQuarter: row.is_first_quarter,
        isLastQuarter: row.is_last_quarter,
        isSupermoon: row.is_supermoon,
        isPerigee: row.is_perigee,
        zodiacSign: row.zodiac_sign,
        zodiacElement: row.zodiac_element,
        biodynamicDayType: row.biodynamic_day_type,
        biodynamicQuality: row.biodynamic_quality
      };
    }

    const calculated = await this.calculateMoonPhase(date, hemisphere);
    await this.saveToDatabase(calculated);
    return calculated;
  }
}