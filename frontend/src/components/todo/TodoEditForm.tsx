import { useState } from 'react';
import type { TodoItem } from '../../types/todo.types';
import { useUpdateTodo } from '../../hooks/useUpdateTodo';
import { getErrorMessage } from '../../utils/errorUtils';
import { isDueDateValid, isValidLength } from '../../utils/validationUtils';
import { formatDateTime } from '../../utils/dateUtils';

interface TodoEditFormProps {
  todo: TodoItem;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TodoEditForm({ todo, onSuccess, onCancel }: TodoEditFormProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? '');
  const [startDate, setStartDate] = useState(todo.startDate);
  const [dueDate, setDueDate] = useState(todo.dueDate);

  const updateMutation = useUpdateTodo(todo.id);

  const dueDateError = dueDate && startDate && !isDueDateValid(startDate, dueDate)
    ? '종료일은 시작일 이후여야 합니다.'
    : null;

  const isSubmitDisabled =
    updateMutation.isPending ||
    !title.trim() ||
    !!dueDateError ||
    !isValidLength(title, 1, 200) ||
    !isValidLength(description, 0, 2000);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitDisabled) return;
    updateMutation.mutate(
      { title: title.trim(), description: description.trim() || undefined, startDate, dueDate },
      { onSuccess }
    );
  }

  const errorMessage = updateMutation.error ? getErrorMessage(updateMutation.error) : null;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label htmlFor="edit-title" style={{ fontWeight: 500, fontSize: '14px' }}>제목 *</label>
          <span style={{ fontSize: '12px', color: 'var(--neutral-500)' }}>{title.length}/200</span>
        </div>
        <input
          id="edit-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label htmlFor="edit-description" style={{ fontWeight: 500, fontSize: '14px' }}>설명</label>
          <span style={{ fontSize: '12px', color: 'var(--neutral-500)' }}>{description.length}/2000</span>
        </div>
        <textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={4}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            fontSize: '14px',
            resize: 'vertical',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="edit-start-date" style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>
            시작일 *
          </label>
          <input
            id="edit-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="edit-due-date" style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>
            종료일 *
          </label>
          <input
            id="edit-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${dueDateError ? '#C62828' : 'var(--border-default)'}`,
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
          {dueDateError && <p style={{ color: '#C62828', fontSize: '12px', marginTop: '4px' }}>{dueDateError}</p>}
        </div>
      </div>
      <div
        style={{
          background: 'var(--neutral-100)',
          border: '1px solid var(--border-default)',
          borderRadius: '6px',
          padding: '12px',
          fontSize: '13px',
          color: 'var(--neutral-500)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <span>완료 여부: {todo.isCompleted ? '완료' : '미완료'}</span>
        {todo.completedAt && <span>완료일시: {formatDateTime(todo.completedAt)}</span>}
      </div>
      {errorMessage && (
        <p role="alert" style={{ color: '#C62828', fontSize: '14px', margin: 0 }}>{errorMessage}</p>
      )}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 18px',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitDisabled}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderRadius: '6px',
            background: isSubmitDisabled ? 'var(--neutral-300)' : 'var(--brand-primary)',
            color: '#fff',
            cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {updateMutation.isPending ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  );
}
