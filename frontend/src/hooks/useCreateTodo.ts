import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTodo } from '../api/todoApi';
import { todoKeys } from './queryKeys';
import type { CreateTodoInput } from '../types/todo.types';

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTodoInput) => createTodo(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}
