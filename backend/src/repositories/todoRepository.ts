import { pool } from '../config/database';
import { Todo, TodoListQuery, TodoStatusFilter, UpdateTodoInput } from '../types/todo.types';

interface TodoRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string;
  due_date: string;
  is_completed: boolean;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const toTodoRecord = (row: TodoRow): Omit<Todo, 'status'> => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  description: row.description,
  startDate: row.start_date,
  dueDate: row.due_date,
  isCompleted: row.is_completed,
  completedAt: row.completed_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const buildStatusCondition = (status: TodoStatusFilter | undefined): string => {
  switch (status) {
    case 'UPCOMING':
      return 'AND start_date > CURRENT_DATE AND is_completed = false';
    case 'IN_PROGRESS':
      return 'AND start_date <= CURRENT_DATE AND due_date >= CURRENT_DATE AND is_completed = false';
    case 'COMPLETED':
      return 'AND is_completed = true AND DATE(completed_at) <= due_date';
    case 'LATE_COMPLETED':
      return 'AND is_completed = true AND DATE(completed_at) > due_date';
    case 'FAILED':
      return 'AND due_date < CURRENT_DATE AND is_completed = false';
    case 'CLOSED':
      return 'AND due_date < CURRENT_DATE';
    default:
      return '';
  }
};

const SORT_COLUMN_MAP: Record<string, string> = {
  startDate: 'start_date',
  dueDate: 'due_date',
  createdAt: 'created_at',
};

export const insertTodo = async (
  userId: string,
  title: string,
  description: string | undefined,
  startDate: string,
  dueDate: string,
): Promise<Omit<Todo, 'status'>> => {
  const result = await pool.query<TodoRow>(
    'INSERT INTO todos (user_id, title, description, start_date, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, title, description ?? null, startDate, dueDate],
  );
  return toTodoRecord(result.rows[0]);
};

export const findById = async (todoId: string): Promise<Omit<Todo, 'status'> | null> => {
  const result = await pool.query<TodoRow>('SELECT * FROM todos WHERE id = $1', [todoId]);
  return result.rows[0] ? toTodoRecord(result.rows[0]) : null;
};

export const findByIdAndUserId = async (
  todoId: string,
  userId: string,
): Promise<Omit<Todo, 'status'> | null> => {
  const result = await pool.query<TodoRow>(
    'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
    [todoId, userId],
  );
  return result.rows[0] ? toTodoRecord(result.rows[0]) : null;
};

export const findByUserId = async (
  userId: string,
  filters: TodoListQuery,
  pagination: { offset: number; limit: number },
): Promise<Omit<Todo, 'status'>[]> => {
  const statusCondition = buildStatusCondition(filters.status);
  const sortColumn = SORT_COLUMN_MAP[filters.sortBy ?? 'createdAt'] ?? 'created_at';
  const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

  const sql = `
    SELECT * FROM todos
    WHERE user_id = $1
    ${statusCondition}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query<TodoRow>(sql, [userId, pagination.limit, pagination.offset]);
  return result.rows.map(toTodoRecord);
};

export const countByUserId = async (
  userId: string,
  filters: Pick<TodoListQuery, 'status'>,
): Promise<number> => {
  const statusCondition = buildStatusCondition(filters.status);

  const sql = `
    SELECT COUNT(*) FROM todos
    WHERE user_id = $1
    ${statusCondition}
  `;

  const result = await pool.query<{ count: string }>(sql, [userId]);
  return Number(result.rows[0].count);
};

export const updateTodo = async (
  todoId: string,
  updates: UpdateTodoInput,
): Promise<Omit<Todo, 'status'> | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${idx++}`);
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(updates.description);
  }
  if (updates.startDate !== undefined) {
    fields.push(`start_date = $${idx++}`);
    values.push(updates.startDate);
  }
  if (updates.dueDate !== undefined) {
    fields.push(`due_date = $${idx++}`);
    values.push(updates.dueDate);
  }

  if (fields.length === 0) {
    return null;
  }

  fields.push(`updated_at = NOW()`);
  values.push(todoId);

  const sql = `UPDATE todos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const result = await pool.query<TodoRow>(sql, values);
  return result.rows[0] ? toTodoRecord(result.rows[0]) : null;
};

export const updateTodoStatus = async (
  todoId: string,
  isCompleted: boolean,
  completedAt: Date | null,
): Promise<Omit<Todo, 'status'> | null> => {
  const result = await pool.query<TodoRow>(
    'UPDATE todos SET is_completed = $1, completed_at = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
    [isCompleted, completedAt, todoId],
  );
  return result.rows[0] ? toTodoRecord(result.rows[0]) : null;
};
