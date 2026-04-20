import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

interface LunarDay {
  calendar_date: string;
  hemisphere: string;
  moon_phase: string;
  moon_phase_precise: number;
  illumination_percent: number;
  moon_age_days: number;
  is_new_moon: boolean;
  is_full_moon: boolean;
  is_first_quarter: boolean;
  is_last_quarter: boolean;
  is_supermoon: boolean;
  is_perigee: boolean;
  zodiac_sign: string;
  zodiac_element: string;
  biodynamic_day_type: string;
  biodynamic_quality: string;
}

const SYNODIC_MONTH = 29.530588853;
const KNOWN_NEW_MOON = new Date('2024-01-11T11:57:00Z');

function calculateMoonAge(date: Date): number {
  const diffMs = date.getTime() - KNOWN_NEW_MOON.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
}

function calculateMoonPhasePrecise(moonAge: number): number {
  return moonAge / SYNODIC_MONTH;
}

function getMoonPhase(moonAge: number): string {
  const phase = moonAge / SYNODIC_MONTH;
  
  if (phase < 0.0625) return 'new_moon';
  if (phase < 0.1875) return 'waxing_crescent';
  if (phase < 0.3125) return 'first_quarter';
  if (phase < 0.4375) return 'waxing_gibbous';
  if (phase < 0.5625) return 'full_moon';
  if (phase < 0.6875) return 'waning_gibbous';
  if (phase < 0.8125) return 'last_quarter';
  if (phase < 0.9375) return 'waning_crescent';
  return 'new_moon';
}

function getIllumination(moonAge: number): number {
  const phase = moonAge / SYNODIC_MONTH;
  return (1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100;
}

function isNewMoon(moonAge: number): boolean {
  return moonAge < 1 || moonAge > SYNODIC_MONTH - 1;
}

function isFullMoon(moonAge: number): boolean {
  const phase = moonAge / SYNODIC_MONTH;
  return phase > 0.48 && phase < 0.52;
}

function isFirstQuarter(moonAge: number): boolean {
  const phase = moonAge / SYNODIC_MONTH;
  return phase > 0.23 && phase < 0.27;
}

function isLastQuarter(moonAge: number): boolean {
  const phase = moonAge / SYNODIC_MONTH;
  return phase > 0.73 && phase < 0.77;
}

function isSupermoon(moonAge: number): boolean {
  return isFullMoon(moonAge) && moonAge > 27.5;
}

function isPerigee(moonAge: number): boolean {
  return moonAge > 27 && moonAge < 28.5;
}

const ZODIAC_SIGNS = [
  { name: 'aries', element: 'fire', start: 0, end: 30 },
  { name: 'taurus', element: 'earth', start: 30, end: 60 },
  { name: 'gemini', element: 'air', start: 60, end: 90 },
  { name: 'cancer', element: 'water', start: 90, end: 120 },
  { name: 'leo', element: 'fire', start: 120, end: 150 },
  { name: 'virgo', element: 'earth', start: 150, end: 180 },
  { name: 'libra', element: 'air', start: 180, end: 210 },
  { name: 'scorpio', element: 'water', start: 210, end: 240 },
  { name: 'sagittarius', element: 'fire', start: 240, end: 270 },
  { name: 'capricorn', element: 'earth', start: 270, end: 300 },
  { name: 'aquarius', element: 'air', start: 300, end: 330 },
  { name: 'pisces', element: 'water', start: 330, end: 360 }
];

function getZodiacSign(date: Date): { sign: string; element: string } {
  const year = date.getFullYear();
  const springStart = new Date(year, 2, 20);
  const daysSinceSpring = (date.getTime() - springStart.getTime()) / (1000 * 60 * 60 * 24);
  const sunLongitude = ((daysSinceSpring / 365.25) * 360) % 360;
  
  const sign = ZODIAC_SIGNS.find(z => sunLongitude >= z.start && sunLongitude < z.end);
  return { sign: sign?.name || 'aries', element: sign?.element || 'fire' };
}

function getBiodynamicDay(date: Date): { type: string; quality: string } {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const dayIndex = dayOfYear % 4;
  
  const types = ['root_day', 'leaf_day', 'flower_day', 'fruit_day'];
  const qualities = ['favorable', 'favorable', 'neutral', 'favorable'];
  
  return { type: types[dayIndex], quality: qualities[dayIndex] };
}

export async function seedLunarCalendar(pool: Pool, year: number = 2026): Promise<void> {
  console.log(`Seeding lunar calendar for year ${year}...`);

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const days: LunarDay[] = [];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const moonAge = calculateMoonAge(d);
    const phasePrecise = calculateMoonPhasePrecise(moonAge);
    const phase = getMoonPhase(moonAge);
    const illumination = getIllumination(moonAge);
    const zodiac = getZodiacSign(d);
    const biodynamic = getBiodynamicDay(d);
    
    days.push({
      calendar_date: d.toISOString().split('T')[0],
      hemisphere: 'northern',
      moon_phase: phase,
      moon_phase_precise: phasePrecise,
      illumination_percent: illumination,
      moon_age_days: moonAge,
      is_new_moon: isNewMoon(moonAge),
      is_full_moon: isFullMoon(moonAge),
      is_first_quarter: isFirstQuarter(moonAge),
      is_last_quarter: isLastQuarter(moonAge),
      is_supermoon: isSupermoon(moonAge),
      is_perigee: isPerigee(moonAge),
      zodiac_sign: zodiac.sign,
      zodiac_element: zodiac.element,
      biodynamic_day_type: biodynamic.type,
      biodynamic_quality: biodynamic.quality
    });
  }

  let inserted = 0;
  let skipped = 0;

  for (const day of days) {
    const existing = await pool.query(
      `SELECT id FROM lunar_calendar WHERE calendar_date = $1 AND hemisphere = $2`,
      [day.calendar_date, day.hemisphere]
    );

    if (existing.rows.length > 0) {
      skipped++;
      continue;
    }

    await pool.query(
      `INSERT INTO lunar_calendar (
        id, calendar_date, hemisphere, moon_phase, moon_phase_precise, illumination_percent,
        moon_age_days, is_new_moon, is_full_moon, is_first_quarter, is_last_quarter,
        is_supermoon, is_perigee, zodiac_sign, zodiac_element,
        biodynamic_day_type, biodynamic_quality, is_verified, created_at, updated_at
      ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, true, NOW(), NOW())`,
      [
        day.calendar_date,
        day.hemisphere,
        day.moon_phase,
        day.moon_phase_precise,
        day.illumination_percent,
        day.moon_age_days,
        day.is_new_moon,
        day.is_full_moon,
        day.is_first_quarter,
        day.is_last_quarter,
        day.is_supermoon,
        day.is_perigee,
        day.zodiac_sign,
        day.zodiac_element,
        day.biodynamic_day_type,
        day.biodynamic_quality
      ]
    );
    inserted++;
  }

  console.log(`Lunar calendar seeded: ${inserted} inserted, ${skipped} skipped for northern hemisphere`);
}

async function main() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'tfm'
  });

  try {
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'lunar_calendar'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.error('Error: lunar_calendar table does not exist!');
      process.exit(1);
    }

    const year = parseInt(process.argv[2]) || new Date().getFullYear();
    await seedLunarCalendar(pool, year);

    const count = await pool.query('SELECT COUNT(*) FROM lunar_calendar');
    console.log(`Total lunar days in database: ${count.rows[0].count}`);

  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();