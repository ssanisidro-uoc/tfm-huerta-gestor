import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function main() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // Delete duplicates, keeping first created (lowest id usually correlates)
    const del = await pool.query(`
      DELETE FROM crop_catalog 
      WHERE id IN (
        SELECT c1.id FROM crop_catalog c1
        WHERE c1.is_active = true
        AND EXISTS (
          SELECT 1 FROM crop_catalog c2
          WHERE c2.is_active = true
          AND LOWER(c1.common_name) = LOWER(c2.common_name)
          AND c1.id > c2.id
        )
      )
    `);
    console.log('Deleted duplicates:', del.rowCount);

    const count = await pool.query('SELECT COUNT(*) as cnt FROM crop_catalog WHERE is_active = true');
    console.log('Final crop count:', count.rows[0].cnt);
  } finally {
    await pool.end();
  }
}

main();