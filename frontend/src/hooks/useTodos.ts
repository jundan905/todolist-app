import { useQuery } from '@tanstack/react-query';
import { getTodos } from '../api/todoApi';
import { todoKeys } from './queryKeys';
import type { TodoFilters } from '../types/todo.types';

export function useTodos(filters: TodoFilters) {
  return useQuery({
    queryKey: todoKeys.list(filters),
    queryFn: () => getTodos(filters),
  });
}
