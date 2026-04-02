import { useTodos } from '../../hooks/useTodos';
import { useToggleTodo } from '../../hooks/useToggleTodo';
import type { TodoFilters } from '../../types/todo.types';
import { TodoCard } from './TodoCard';
import { Pagination } from '../common/Pagination';
import { Spinner } from '../common/Spinner';

interface TodoListProps {
  filters: TodoFilters;
  onPageChange: (page: number) => void;
}

export function TodoList({ filters, onPageChange }: TodoListProps) {
  const { data, isLoading, isError } = useTodos(filters);
  const toggleMutation = useToggleTodo(filters);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#C62828' }}>
        할일 목록을 불러오는데 실패했습니다.
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--neutral-500)', fontSize: '15px' }}>
        등록된 할일이 없습니다
      </div>
    );
  }

  function handleToggle(todoId: string, isCompleted: boolean) {
    toggleMutation.mutate({ todoId, isCompleted });
  }

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {data.data.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            isToggling={toggleMutation.isPending}
          />
        ))}
      </div>
      <Pagination pagination={data.pagination} onPageChange={onPageChange} />
    </div>
  );
}
