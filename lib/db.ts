// lib/db.ts
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // You can add ssl: { rejectUnauthorized: false } for some hosts if needed
});

export default {
  query: (text: string, params?: any[]) => pool.query(text, params),
};
