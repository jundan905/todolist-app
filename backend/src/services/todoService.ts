import * as todoRepository from '../repositories/todoRepository';
import { computeTodoStatus } from '../utils/todoStatusUtils';
import { AppError } from '../errors/AppError';
import { Todo, CreateTodoInput, UpdateTodoInput, TodoListQuery } from '../types/todo.types';

const withStatus = (row: Omit<Todo, 'status'>): Todo => ({
  ...row,
  status: computeTodoStatus(row.isCompleted, row.completedAt, row.startDate, row.dueDate),
});

export const createTodo = async (userId: string, input: CreateTodoInput): Promise<Todo> => {
  const { title, startDate, dueDate, description } = input;

  if (!title || !startDate || !dueDate) {
    throw new AppError('필수 입력값이 누락되었습니다.', 400, 'MISSING_FIELDS');
  }

  if (dueDate < startDate) {
    throw new AppError('종료일은 시작일보다 이전일 수 없습니다.', 400, 'INVALID_DATE_RANGE');
  }

  const row = await todoRepository.insertTodo(userId, title, description, startDate, dueDate);
  return withStatus(row);
};

export const getTodoList = async (
  userId: string,
  query: TodoListQuery,
): Promise<{ data: Todo[]; pagination: object }> => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const sortBy = query.sortBy ?? 'createdAt';
  const sortOrder = query.sortOrder ?? 'desc';

  const filters: TodoListQuery = { ...query, page, limit, sortBy, sortOrder };

  const total = await todoRepository.countByUserId(userId, { status: query.status });
  const offset = (page - 1) * limit;
  const rows = await todoRepository.findByUserId(userId, filters, { offset, limit });

  const data = rows.map(withStatus);
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const getTodoDetail = async (userId: string, todoId: string): Promise<Todo> => {
  const row = await todoRepository.findByIdAndUserId(todoId, userId);

  if (!row) {
    const exists = await todoRepository.findById(todoId);
    if (!exists) {
      throw new AppError('할 일을 찾을 수 없습니다.', 404, 'TODO_NOT_FOUND');
    }
    throw new AppError('접근 권한이 없습니다.', 403, 'FORBIDDEN');
  }

  return withStatus(row);
};

export const updateTodo = async (
  userId: string,
  todoId: string,
  input: UpdateTodoInput,
): Promise<Todo> => {
  const current = await getTodoDetail(userId, todoId);

  if (
    input.title === undefined &&
    input.description === undefined &&
    input.startDate === undefined &&
    input.dueDate === undefined
  ) {
    throw new AppError('수정할 필드가 없습니다.', 400, 'NO_FIELDS');
  }

  const effectiveStartDate = input.startDate ?? current.startDate;
  const effectiveDueDate = input.dueDate ?? current.dueDate;

  if (effectiveDueDate < effectiveStartDate) {
    throw new AppError('종료일은 시작일보다 이전일 수 없습니다.', 400, 'INVALID_DATE_RANGE');
  }

  const updated = await todoRepository.updateTodo(todoId, input);
  if (!updated) {
    throw new AppError('할 일 수정에 실패했습니다.', 500, 'UPDATE_FAILED');
  }

  return withStatus(updated);
};

export const toggleTodoComplete = async (
  userId: string,
  todoId: string,
  isCompleted: boolean,
): Promise<Todo> => {
  await getTodoDetail(userId, todoId);

  const completedAt = isCompleted ? new Date() : null;
  const updated = await todoRepository.updateTodoStatus(todoId, isCompleted, completedAt);

  if (!updated) {
    throw new AppError('상태 변경에 실패했습니다.', 500, 'UPDATE_FAILED');
  }

  return withStatus(updated);
};
