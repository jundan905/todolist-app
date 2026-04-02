import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TodoCard } from '../TodoCard';
import type { TodoItem } from '../../../types/todo.types';

const mockTodo: TodoItem = {
  id: 'todo-1',
  userId: 'user-1',
  title: '테스트 할일 제목',
  description: '테스트 설명입니다.',
  startDate: '2026-04-01',
  dueDate: '2026-04-30',
  isCompleted: false,
  completedAt: null,
  status: 'IN_PROGRESS',
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

function renderCard(todo: TodoItem = mockTodo) {
  return render(
    <MemoryRouter>
      <TodoCard todo={todo} onToggle={vi.fn()} />
    </MemoryRouter>
  );
}

describe('TodoCard', () => {
  it('제목이 렌더링된다', () => {
    renderCard();
    expect(screen.getByText('테스트 할일 제목')).toBeInTheDocument();
  });

  it('날짜 범위가 렌더링된다', () => {
    renderCard();
    expect(screen.getByText(/2026년 04월 01일/)).toBeInTheDocument();
    expect(screen.getByText(/2026년 04월 30일/)).toBeInTheDocument();
  });

  it('상태 뱃지가 렌더링된다', () => {
    renderCard();
    expect(screen.getByText('진행 중')).toBeInTheDocument();
  });

  it('description이 있을 때 렌더링된다', () => {
    renderCard();
    expect(screen.getByText('테스트 설명입니다.')).toBeInTheDocument();
  });
});
