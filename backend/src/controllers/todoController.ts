import { Request, Response, NextFunction } from 'express';
import * as todoService from '../services/todoService';
import { AppError } from '../errors/AppError';
import { TodoListQuery, UpdateTodoInput } from '../types/todo.types';

export const handleCreateTodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { title, description, startDate, dueDate } = req.body;

    if (!title || !startDate || !dueDate) {
      throw new AppError('필수 입력값이 누락되었습니다.', 400, 'MISSING_FIELDS');
    }

    const todo = await todoService.createTodo(userId, { title, description, startDate, dueDate });
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
};

export const handleGetTodos = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const status = req.query.status as TodoListQuery['status'];
    const sortBy = req.query.sortBy as TodoListQuery['sortBy'];
    const sortOrder = req.query.sortOrder as TodoListQuery['sortOrder'];

    if (req.query.page !== undefined && page !== undefined && page < 1) {
      throw new AppError('page 는 1 이상의 정수여야 합니다.', 400, 'INVALID_PAGE');
    }

    if (req.query.limit !== undefined) {
      if (limit === undefined || limit < 1 || limit > 100) {
        throw new AppError('limit 은 1 이상 100 이하의 정수여야 합니다.', 400, 'INVALID_LIMIT');
      }
    }

    const validStatuses = ['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'LATE_COMPLETED', 'FAILED', 'CLOSED'];
    if (status && !validStatuses.includes(status)) {
      throw new AppError('유효하지 않은 status 값입니다.', 400, 'INVALID_STATUS');
    }

    const validSortBy = ['startDate', 'dueDate', 'createdAt'];
    if (sortBy && !validSortBy.includes(sortBy)) {
      throw new AppError('유효하지 않은 sortBy 값입니다.', 400, 'INVALID_SORT_BY');
    }

    const validSortOrder = ['asc', 'desc'];
    if (sortOrder && !validSortOrder.includes(sortOrder)) {
      throw new AppError('유효하지 않은 sortOrder 값입니다.', 400, 'INVALID_SORT_ORDER');
    }

    const query: TodoListQuery = { page, limit, status, sortBy, sortOrder };
    const result = await todoService.getTodoList(userId, query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const handleGetTodoById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const todoId = Array.isArray(req.params.todoId) ? req.params.todoId[0] : req.params.todoId;
    const todo = await todoService.getTodoDetail(userId, todoId);
    res.status(200).json(todo);
  } catch (err) {
    next(err);
  }
};

export const handleUpdateTodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const todoId = Array.isArray(req.params.todoId) ? req.params.todoId[0] : req.params.todoId;
    const { title, description, startDate, dueDate } = req.body;

    const input: UpdateTodoInput = {};
    if (title !== undefined) input.title = title;
    if (description !== undefined) input.description = description;
    if (startDate !== undefined) input.startDate = startDate;
    if (dueDate !== undefined) input.dueDate = dueDate;

    const todo = await todoService.updateTodo(userId, todoId, input);
    res.status(200).json(todo);
  } catch (err) {
    next(err);
  }
};

export const handleCompleteTodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const todoId = Array.isArray(req.params.todoId) ? req.params.todoId[0] : req.params.todoId;
    const { isCompleted } = req.body;

    if (typeof isCompleted !== 'boolean') {
      throw new AppError('isCompleted 는 부울린 값이어야 합니다.', 400, 'INVALID_FIELD');
    }

    const todo = await todoService.toggleTodoComplete(userId, todoId, isCompleted);
    res.status(200).json(todo);
  } catch (err) {
    next(err);
  }
};
