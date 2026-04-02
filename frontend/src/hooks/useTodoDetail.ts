import { useQuery } from '@tanstack/react-query';
import { getTodo } from '../api/todoApi';
import { todoKeys } from './queryKeys';

export function useTodoDetail(todoId: string) {
  return useQuery({
    queryKey: todoKeys.detail(todoId),
    queryFn: () => getTodo(todoId),
    enabled: !!todoId,
  });
}
