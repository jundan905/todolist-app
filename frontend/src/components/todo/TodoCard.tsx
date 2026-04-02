import { Link } from 'react-router-dom';
import type { TodoItem } from '../../types/todo.types';
import { TodoStatusBadge } from './TodoStatusBadge';
import { TodoCheckButton } from './TodoCheckButton';
import { formatDate } from '../../utils/dateUtils';
import { computeTodoStatus } from '../../utils/todoStatusUtils';
import { Calendar, Pencil } from 'lucide-react';

interface TodoCardProps {
  todo: TodoItem;
  onToggle: (todoId: string, isCompleted: boolean) => void;
  isToggling?: boolean;
}

export function TodoCard({ todo, onToggle, isToggling }: TodoCardProps) {
  // 프론트엔드에서 상태 재계산 (백엔드 날짜 포맷 이슈 대응)
  const calculatedStatus = computeTodoStatus(
    todo.startDate,
    todo.dueDate,
    todo.isCompleted,
    todo.completedAt
  );

  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <TodoStatusBadge status={calculatedStatus} />
        <Link
          to={`/todos/${todo.id}/edit`}
          aria-label="수정"
          style={{ color: 'var(--neutral-500)', display: 'flex', alignItems: 'center' }}
        >
          <Pencil size={16} />
        </Link>
      </div>
      <p
        style={{
          fontWeight: 600,
          fontSize: '15px',
          color: 'var(--neutral-900)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          margin: 0,
        }}
      >
        {todo.title}
      </p>
      {todo.description && (
        <p
          style={{
            fontSize: '13px',
            color: 'var(--neutral-700)',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {todo.description}
        </p>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: 'var(--neutral-500)',
          }}
        >
          <Calendar size={14} />
          {formatDate(todo.startDate)} ~ {formatDate(todo.dueDate)}
        </span>
        <TodoCheckButton
          todoId={todo.id}
          isCompleted={todo.isCompleted}
          disabled={isToggling}
          onToggle={onToggle}
        />
      </div>
    </div>
  );
}
