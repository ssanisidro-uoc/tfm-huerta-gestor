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
    const result = await pool.query(`
      SELECT cc.compatibility_type, COUNT(*) as cnt 
      FROM crop_compatibilities cc 
      WHERE cc.is_active = true 
      GROUP BY cc.compatibility_type
    `);
    console.log('Compatibilities by type:');
    for (const row of result.rows) {
      console.log(`  ${row.compatibility_type}: ${row.cnt}`);
    }
    const totalResult = await pool.query('SELECT COUNT(*) as cnt FROM crop_compatibilities WHERE is_active = true');
    console.log(`Total: ${totalResult.rows[0].cnt}`);
  } finally {
    await pool.end();
  }
}

main();