import { LunarCalendar, LunarCalendarProps } from '../../domain/LunarCalendar/LunarCalendar';
import { LunarCalendarRepository, SearchCriteria } from '../../domain/LunarCalendarRepository';
import { Pool } from 'pg';

export class PostgresLunarCalendarRepository implements LunarCalendarRepository {
  constructor(private pool: Pool) {}

  async findByDate(date: Date, hemisphere: string): Promise<LunarCalendar | null> {
    const query = `
      SELECT * FROM lunar_calendar 
      WHERE calendar_date = $1 AND hemisphere = $2 AND is_active = true
    `;
    const result = await this.pool.query(query, [date, hemisphere]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(result.rows[0]);
  }

  async findByDateRange(startDate: Date, endDate: Date, hemisphere: string): Promise<LunarCalendar[]> {
    const query = `
      SELECT * FROM lunar_calendar 
      WHERE calendar_date BETWEEN $1 AND $2 
        AND hemisphere = $3 
        AND is_active = true
      ORDER BY calendar_date ASC
    `;
    const result = await this.pool.query(query, [startDate, endDate, hemisphere]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  async findByMonth(year: number, month: number, hemisphere: string): Promise<LunarCalendar[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return this.findByDateRange(startDate, endDate, hemisphere);
  }

  async search(criteria: Partial<SearchCriteria>): Promise<LunarCalendar[]> {
    let query = 'SELECT * FROM lunar_calendar WHERE is_active = true';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (criteria.hemisphere) {
      query += ` AND hemisphere = $${paramIndex++}`;
      params.push(criteria.hemisphere);
    }
    if (criteria.moonPhase) {
      query += ` AND moon_phase = $${paramIndex++}`;
      params.push(criteria.moonPhase);
    }
    if (criteria.biodynamicDayType) {
      query += ` AND biodynamic_day_type = $${paramIndex++}`;
      params.push(criteria.biodynamicDayType);
    }
    if (criteria.zodiacSign) {
      query += ` AND zodiac_sign = $${paramIndex++}`;
      params.push(criteria.zodiacSign);
    }
    if (criteria.zodiacElement) {
      query += ` AND zodiac_element = $${paramIndex++}`;
      params.push(criteria.zodiacElement);
    }
    if (criteria.isPerigee) {
      query += ` AND is_perigee = $${paramIndex++}`;
      params.push(criteria.isPerigee);
    }
    if (criteria.isFullMoon) {
      query += ` AND is_full_moon = $${paramIndex++}`;
      params.push(criteria.isFullMoon);
    }
    if (criteria.isNewMoon) {
      query += ` AND is_new_moon = $${paramIndex++}`;
      params.push(criteria.isNewMoon);
    }

    query += ' ORDER BY calendar_date ASC LIMIT 100';

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  async save(calendar: LunarCalendar): Promise<void> {
    const data = calendar.toJSON();
    
    const query = `
      INSERT INTO lunar_calendar (
        id, calendar_date, hemisphere, moon_phase, moon_phase_precise, illumination_percent,
        moon_age_days, is_new_moon, is_full_moon, is_first_quarter, is_last_quarter,
        is_supermoon, is_blue_moon, is_eclipse, eclipse_type, lunar_distance_km,
        is_perigee, is_apogee, perigee_effect_strength, zodiac_sign, zodiac_element,
        biodynamic_day_type, biodynamic_quality, moonrise_time, moonset_time,
        moon_culmination_time, data_source, is_verified, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        moon_phase = $4,
        moon_phase_precise = $5,
        illumination_percent = $6,
        updated_at = NOW()
    `;

    await this.pool.query(query, [
      data.id,
      data.calendar_date,
      data.hemisphere,
      data.moon_phase,
      data.moon_phase_precise,
      data.illumination_percent,
      data.moon_age_days,
      data.is_new_moon,
      data.is_full_moon,
      data.is_first_quarter,
      data.is_last_quarter,
      data.is_supermoon,
      data.is_blue_moon,
      data.is_eclipse,
      data.eclipse_type,
      data.lunar_distance_km,
      data.is_perigee,
      data.is_apogee,
      data.perigee_effect_strength,
      data.zodiac_sign,
      data.zodiac_element,
      data.biodynamic_day_type,
      data.biodynamic_quality,
      data.moonrise_time,
      data.moonset_time,
      data.moon_culmination_time,
      'calculation',
      true,
      true
    ]);
  }

  async saveMany(calendars: LunarCalendar[]): Promise<void> {
    for (const calendar of calendars) {
      await this.save(calendar);
    }
  }

  async getNextNewMoon(afterDate: Date, hemisphere: string): Promise<LunarCalendar | null> {
    const query = `
      SELECT * FROM lunar_calendar 
      WHERE calendar_date > $1 AND hemisphere = $2 AND is_new_moon = true AND is_active = true
      ORDER BY calendar_date ASC LIMIT 1
    `;
    const result = await this.pool.query(query, [afterDate, hemisphere]);
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getNextFullMoon(afterDate: Date, hemisphere: string): Promise<LunarCalendar | null> {
    const query = `
      SELECT * FROM lunar_calendar 
      WHERE calendar_date > $1 AND hemisphere = $2 AND is_full_moon = true AND is_active = true
      ORDER BY calendar_date ASC LIMIT 1
    `;
    const result = await this.pool.query(query, [afterDate, hemisphere]);
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async count(): Promise<number> {
    const result = await this.pool.query(
      'SELECT COUNT(*) as cnt FROM lunar_calendar WHERE is_active = true'
    );
    return parseInt(result.rows[0].cnt);
  }

  private mapRowToEntity(row: Record<string, unknown>): LunarCalendar {
    const props: LunarCalendarProps = {
      id: row.id as string,
      calendarDate: new Date(row.calendar_date as string),
      hemisphere: row.hemisphere as string,
      moonPhase: row.moon_phase as string,
      moonPhasePrecise: row.moon_phase_precise as number,
      illuminationPercent: row.illumination_percent as number,
      moonAgeDays: row.moon_age_days as number,
      isNewMoon: row.is_new_moon as boolean,
      isFullMoon: row.is_full_moon as boolean,
      isFirstQuarter: row.is_first_quarter as boolean,
      isLastQuarter: row.is_last_quarter as boolean,
      isSupermoon: row.is_supermoon as boolean,
      isBlueMoon: row.is_blue_moon as boolean,
      isEclipse: row.is_eclipse as boolean,
      eclipseType: row.eclipse_type as string,
      lunarDistanceKm: row.lunar_distance_km as number,
      isPerigee: row.is_perigee as boolean,
      isApogee: row.is_apogee as boolean,
      perigeeEffectStrength: row.perigee_effect_strength as number,
      zodiacSign: row.zodiac_sign as string,
      zodiacElement: row.zodiac_element as string,
      biodynamicDayType: row.biodynamic_day_type as string,
      biodynamicQuality: row.biodynamic_quality as string,
      isActive: row.is_active as boolean
    };

    return new LunarCalendar(props);
  }
}