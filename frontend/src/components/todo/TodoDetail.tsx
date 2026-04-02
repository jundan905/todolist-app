import { Link, useNavigate } from 'react-router-dom';
import type { TodoItem } from '../../types/todo.types';
import { TodoStatusBadge } from './TodoStatusBadge';
import { TodoCheckButton } from './TodoCheckButton';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { useToggleTodo } from '../../hooks/useToggleTodo';
import { ArrowLeft, Pencil } from 'lucide-react';

interface TodoDetailProps {
  todo: TodoItem;
}

export function TodoDetail({ todo }: TodoDetailProps) {
  const navigate = useNavigate();
  const toggleMutation = useToggleTodo({});

  function handleToggle(todoId: string, isCompleted: boolean) {
    toggleMutation.mutate({ todoId, isCompleted });
  }

  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '640px',
        margin: '0 auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={() => void navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--neutral-500)' }}
          aria-label="뒤로가기"
        >
          <ArrowLeft size={20} />
        </button>
        <TodoStatusBadge status={todo.status} />
      </div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>{todo.title}</h1>
      {todo.description && (
        <p style={{ fontSize: '15px', color: 'var(--neutral-700)', margin: 0, lineHeight: 1.6 }}>
          {todo.description}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--neutral-500)' }}>
        <span>시작일: {formatDate(todo.startDate)}</span>
        <span>종료일: {formatDate(todo.dueDate)}</span>
        {todo.completedAt && <span>완료일시: {formatDateTime(todo.completedAt)}</span>}
        <span>생성일: {formatDateTime(todo.createdAt)}</span>
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <TodoCheckButton
          todoId={todo.id}
          isCompleted={todo.isCompleted}
          disabled={toggleMutation.isPending}
          onToggle={handleToggle}
        />
        <span style={{ fontSize: '14px', color: 'var(--neutral-500)' }}>
          {todo.isCompleted ? '완료됨' : '미완료'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Link
          to={`/todos/${todo.id}/edit`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'var(--brand-primary)',
            color: '#fff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <Pencil size={14} />
          수정
        </Link>
      </div>
    </div>
  );
}
