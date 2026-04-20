import { Pool } from 'pg';
import { logger } from '../../Shared/infrastructure/Logger';

export interface LunarMonthlyCalendar {
  id: string;
  year: number;
  month: number;
  hemisphere: string;
  new_moon_dates: Date[];
  full_moon_dates: Date[];
  first_quarter_dates: Date[];
  last_quarter_dates: Date[];
  favorable_sowing_dates_root: Date[];
  favorable_sowing_dates_leaf: Date[];
  favorable_sowing_dates_flower: Date[];
  favorable_sowing_dates_fruit: Date[];
  unfavorable_dates: Date[];
  monthly_summary: string;
}

export class LunarMonthlyCalendarService {
  constructor(private pool: Pool) {}

  async getCalendar(year: number, month: number, hemisphere: string = 'northern'): Promise<LunarMonthlyCalendar | null> {
    const query = `
      SELECT * FROM lunar_monthly_calendar 
      WHERE year = $1 AND month = $2 AND hemisphere = $3
    `;

    const result = await this.pool.query(query, [year, month, hemisphere]);
    return result.rows[0] || null;
  }

  async getOrCreateCalendar(year: number, month: number, hemisphere: string = 'northern'): Promise<LunarMonthlyCalendar> {
    let calendar = await this.getCalendar(year, month, hemisphere);

    if (!calendar) {
      calendar = await this.generateCalendar(year, month, hemisphere);
    }

    return calendar;
  }

  private async generateCalendar(year: number, month: number, hemisphere: string): Promise<LunarMonthlyCalendar> {
    const dates = this.calculateMoonPhases(year, month);
    
    const query = `
      INSERT INTO lunar_monthly_calendar (
        year, month, hemisphere,
        new_moon_dates, full_moon_dates, first_quarter_dates, last_quarter_dates,
        favorable_sowing_dates_root, favorable_sowing_dates_leaf, 
        favorable_sowing_dates_flower, favorable_sowing_dates_fruit,
        unfavorable_dates, monthly_summary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      year, month, hemisphere,
      dates.newMoons, dates.fullMoons, dates.firstQuarter, dates.lastQuarter,
      dates.favorableRoot, dates.favorableLeaf, dates.favorableFlower, dates.favorableFruit,
      dates.unfavorable, dates.summary
    ]);

    logger.info(`Generated lunar calendar for ${year}-${month}`, 'LunarMonthlyCalendarService');

    return result.rows[0];
  }

  private calculateMoonPhases(year: number, month: number) {
    const knownNewMoon = new Date('2024-01-11T11:57:00Z');
    const lunarCycle = 29.53059;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const newMoons: Date[] = [];
    const fullMoons: Date[] = [];
    const firstQuarter: Date[] = [];
    const lastQuarter: Date[] = [];
    const unfavorable: Date[] = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const diffTime = d.getTime() - knownNewMoon.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      const moonAge = ((diffDays % lunarCycle) + lunarCycle) % lunarCycle;

      if (moonAge < 1.85) newMoons.push(new Date(d));
      else if (moonAge > 7.38 && moonAge < 9.23) firstQuarter.push(new Date(d));
      else if (moonAge > 14.77 && moonAge < 16.61) fullMoons.push(new Date(d));
      else if (moonAge > 22.15 && moonAge < 23.99) lastQuarter.push(new Date(d));

      if (moonAge < 1 || moonAge > 28.5) unfavorable.push(new Date(d));
    }

    const favorableRoot = this.getFavorableDatesByPhase(firstQuarter, lastQuarter);
    const favorableLeaf = this.getFavorableDatesByPhase(newMoons, fullMoons);
    const favorableFlower = this.getFavorableDatesByPhase(firstQuarter);
    const favorableFruit = this.getFavorableDatesByPhase(fullMoons);

    const summary = `Luna nueva: ${newMoons.length}, Luna llena: ${fullMoons.length}. ` +
      `Favorable hoja: ${favorableLeaf.length} días, Fruta: ${favorableFruit.length} días.`;

    return {
      newMoons: newMoons.map(d => d.toISOString().split('T')[0]),
      fullMoons: fullMoons.map(d => d.toISOString().split('T')[0]),
      firstQuarter: firstQuarter.map(d => d.toISOString().split('T')[0]),
      lastQuarter: lastQuarter.map(d => d.toISOString().split('T')[0]),
      favorableRoot, favorableLeaf, favorableFlower, favorableFruit,
      unfavorable: unfavorable.map(d => d.toISOString().split('T')[0]),
      summary
    };
  }

  private getFavorableDatesByPhase(...dateArrays: Date[][]): string[] {
    const allDates: Date[] = [];
    for (const arr of dateArrays) {
      allDates.push(...arr);
    }
    return allDates.map(d => d.toISOString().split('T')[0]);
  }
}
