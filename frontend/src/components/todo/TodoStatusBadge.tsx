import type { TodoStatus } from '../../types/todo.types';

const statusConfig: Record<TodoStatus, { label: string; bg: string; text: string }> = {
  UPCOMING: { label: '예정', bg: 'var(--status-upcoming-bg)', text: 'var(--status-upcoming-text)' },
  IN_PROGRESS: { label: '진행 중', bg: 'var(--status-inprogress-bg)', text: 'var(--status-inprogress-text)' },
  COMPLETED: { label: '완료', bg: 'var(--status-completed-bg)', text: 'var(--status-completed-text)' },
  LATE_COMPLETED: { label: '지연 완료', bg: 'var(--status-late-bg)', text: 'var(--status-late-text)' },
  FAILED: { label: '실패', bg: 'var(--status-failed-bg)', text: 'var(--status-failed-text)' },
};

interface TodoStatusBadgeProps {
  status: TodoStatus;
}

export function TodoStatusBadge({ status }: TodoStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.text,
      }}
    >
      {config.label}
    </span>
  );
}
