import { CheckCircle, Circle } from 'lucide-react';

interface TodoCheckButtonProps {
  todoId: string;
  isCompleted: boolean;
  disabled?: boolean;
  onToggle: (todoId: string, isCompleted: boolean) => void;
}

export function TodoCheckButton({ todoId, isCompleted, disabled, onToggle }: TodoCheckButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(todoId, !isCompleted)}
      disabled={disabled}
      aria-label={isCompleted ? '완료 취소' : '완료 처리'}
      style={{
        background: 'none',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        color: isCompleted ? 'var(--status-completed-text)' : 'var(--neutral-300)',
      }}
    >
      {isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
    </button>
  );
}
