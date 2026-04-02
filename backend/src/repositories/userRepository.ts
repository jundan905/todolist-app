import { pool } from '../config/database';

interface UserRow {
  id: string;
  email: string;
  password: string;
  name: string;
  created_at: Date;
}

export const findByEmail = async (email: string): Promise<UserRow | null> => {
  const result = await pool.query<UserRow>(
    'SELECT id, email, password, name, created_at FROM users WHERE email = $1',
    [email],
  );
  return result.rows[0] ?? null;
};

export const insertUser = async (
  email: string,
  hashedPassword: string,
  name: string,
): Promise<UserRow> => {
  const result = await pool.query<UserRow>(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
    [email, hashedPassword, name],
  );
  return result.rows[0];
};

export const findById = async (userId: string): Promise<UserRow | null> => {
  const result = await pool.query<UserRow>(
    'SELECT id, email, name, created_at FROM users WHERE id = $1',
    [userId],
  );
  return result.rows[0] ?? null;
};
