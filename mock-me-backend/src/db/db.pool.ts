import { Pool } from 'pg';
import { env } from '../shared/config/environment';

export const pool = new Pool({
  connectionString: env.DATABASE_URL
});
