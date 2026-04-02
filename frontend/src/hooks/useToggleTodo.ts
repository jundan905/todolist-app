import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleComplete } from '../api/todoApi';
import { todoKeys } from './queryKeys';
import { computeTodoStatus } from '../utils/todoStatusUtils';
import type { PaginatedResponse, PaginationMeta } from '../types/api.types';
import type { TodoItem, TodoFilters } from '../types/todo.types';

export function useToggleTodo(filters: TodoFilters) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ todoId, isCompleted }: { todoId: string; isCompleted: boolean }) =>
      toggleComplete(todoId, isCompleted),
    onMutate: async ({ todoId, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.list(filters) });

      const previousData = queryClient.getQueryData<PaginatedResponse<TodoItem>>(todoKeys.list(filters));

      if (previousData) {
        const completedAt = isCompleted ? new Date().toISOString() : null;
        queryClient.setQueryData<PaginatedResponse<TodoItem>>(todoKeys.list(filters), {
          ...previousData,
          data: previousData.data.map((todo) => {
            if (todo.id !== todoId) return todo;
            const newStatus = computeTodoStatus(
              todo.startDate,
              todo.dueDate,
              isCompleted,
              completedAt
            );
            return { ...todo, isCompleted, completedAt, status: newStatus };
          }),
          pagination: previousData.pagination as PaginationMeta,
        });
      }

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(todoKeys.list(filters), context.previousData);
      }
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: todoKeys.detail(variables.todoId) });
    },
  });
}
