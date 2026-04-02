import { useState } from 'react';
import { useCreateTodo } from '../../hooks/useCreateTodo';
import { getErrorMessage } from '../../utils/errorUtils';
import { isDueDateValid, isValidLength } from '../../utils/validationUtils';
import { getTodayString } from '../../utils/dateUtils';

interface TodoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function TodoForm({ onSuccess, onCancel }: TodoFormProps) {
  const today = getTodayString();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [dueDate, setDueDate] = useState(today);

  const createMutation = useCreateTodo();

  const dueDateError = dueDate && startDate && !isDueDateValid(startDate, dueDate)
    ? '종료일은 시작일 이후여야 합니다.'
    : null;

  const titleError = title.length > 0 && !isValidLength(title, 1, 200)
    ? '제목은 1~200자 사이여야 합니다.'
    : null;

  const isSubmitDisabled =
    createMutation.isPending ||
    !title.trim() ||
    !!dueDateError ||
    !!titleError ||
    !isValidLength(description, 0, 2000);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitDisabled) return;
    createMutation.mutate(
      { title: title.trim(), description: description.trim() || undefined, startDate, dueDate },
      { onSuccess }
    );
  }

  const errorMessage = createMutation.error ? getErrorMessage(createMutation.error) : null;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label htmlFor="todo-title" style={{ fontWeight: 500, fontSize: '14px' }}>제목 *</label>
          <span style={{ fontSize: '12px', color: 'var(--neutral-500)' }}>{title.length}/200</span>
        </div>
        <input
          id="todo-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
          style={{
            width: '100%',
            padding: '10px 12px',
            border: `1px solid ${titleError ? '#C62828' : 'var(--border-default)'}`,
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
        {titleError && <p style={{ color: '#C62828', fontSize: '12px', marginTop: '4px' }}>{titleError}</p>}
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label htmlFor="todo-description" style={{ fontWeight: 500, fontSize: '14px' }}>설명</label>
          <span style={{ fontSize: '12px', color: 'var(--neutral-500)' }}>{description.length}/2000</span>
        </div>
        <textarea
          id="todo-description"
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
          <label htmlFor="todo-start-date" style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>
            시작일 *
          </label>
          <input
            id="todo-start-date"
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
          <label htmlFor="todo-due-date" style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>
            종료일 *
          </label>
          <input
            id="todo-due-date"
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
          {createMutation.isPending ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  );
}
