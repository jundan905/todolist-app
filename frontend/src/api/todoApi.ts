import type { TodoItem, TodoFilters, CreateTodoInput, UpdateTodoInput } from '../types/todo.types';
import type { PaginatedResponse } from '../types/api.types';
import axiosInstance from './axiosInstance';

export async function getTodos(filters?: TodoFilters): Promise<PaginatedResponse<TodoItem>> {
  const response = await axiosInstance.get<PaginatedResponse<TodoItem>>('/api/todos', {
    params: filters,
  });
  return response.data;
}

export async function getTodo(todoId: string): Promise<TodoItem> {
  const response = await axiosInstance.get<TodoItem>(`/api/todos/${todoId}`);
  return response.data;
}

export async function createTodo(input: CreateTodoInput): Promise<TodoItem> {
  const response = await axiosInstance.post<TodoItem>('/api/todos', input);
  return response.data;
}

export async function updateTodo(todoId: string, input: UpdateTodoInput): Promise<TodoItem> {
  const response = await axiosInstance.patch<TodoItem>(`/api/todos/${todoId}`, input);
  return response.data;
}

export async function toggleComplete(todoId: string, isCompleted: boolean): Promise<TodoItem> {
  const response = await axiosInstance.patch<TodoItem>(`/api/todos/${todoId}/complete`, { isCompleted });
  return response.data;
}
