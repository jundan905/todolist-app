import { Pool } from 'pg';
import { config } from './index';

export const pool = new Pool({
  connectionString: config.db.url,
  max: config.db.pool.max,
  idleTimeoutMillis: config.db.pool.idleTimeoutMillis,
  connectionTimeoutMillis: config.db.pool.connectionTimeoutMillis,
});

pool.on('error', (err) => {
  console.error('[Database] 유휴 클라이언트 오류:', err);
});

export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log('[Database] Connection pool 종료');
};
