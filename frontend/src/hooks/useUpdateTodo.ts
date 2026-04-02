import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTodo } from '../api/todoApi';
import { todoKeys } from './queryKeys';
import type { UpdateTodoInput } from '../types/todo.types';

export function useUpdateTodo(todoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTodoInput) => updateTodo(todoId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.detail(todoId) });
      void queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}
