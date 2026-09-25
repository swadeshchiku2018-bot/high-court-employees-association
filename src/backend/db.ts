process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("⚠️ DATABASE_URL is not defined in environment variables!");
}

export const pool = new Pool({
  connectionString,
  ssl: (process.env.VERCEL || connectionString?.includes('sslmode=') || connectionString?.includes('aivencloud.com'))
    ? { rejectUnauthorized: false } 
    : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.DEBUG_SQL) {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res.rows;
  } catch (error) {
    console.error('Database query error:', { text, error });
    throw error;
  }
}
