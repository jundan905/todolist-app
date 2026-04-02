import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoCheckButton } from '../TodoCheckButton';

describe('TodoCheckButton', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it('미완료 상태일 때 빈 원 아이콘이 표시된다', () => {
    render(
      <TodoCheckButton
        todoId="todo-1"
        isCompleted={false}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByLabelText('완료 처리')).toBeInTheDocument();
  });

  it('완료 상태일 때 체크된 원 아이콘이 표시된다', () => {
    render(
      <TodoCheckButton
        todoId="todo-1"
        isCompleted={true}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByLabelText('완료 취소')).toBeInTheDocument();
  });

  it('클릭 시 onToggle 이 호출된다', () => {
    render(
      <TodoCheckButton
        todoId="todo-1"
        isCompleted={false}
        onToggle={mockOnToggle}
      />
    );

    fireEvent.click(screen.getByLabelText('완료 처리'));

    expect(mockOnToggle).toHaveBeenCalledWith('todo-1', true);
  });

  it('완료 상태에서 클릭 시 토글된다', () => {
    render(
      <TodoCheckButton
        todoId="todo-1"
        isCompleted={true}
        onToggle={mockOnToggle}
      />
    );

    fireEvent.click(screen.getByLabelText('완료 취소'));

    expect(mockOnToggle).toHaveBeenCalledWith('todo-1', false);
  });

  it('disabled 상태일 때 버튼이 비활성화된다', () => {
    render(
      <TodoCheckButton
        todoId="todo-1"
        isCompleted={false}
        disabled={true}
        onToggle={mockOnToggle}
      />
    );

    const button = screen.getByLabelText('완료 처리');
    expect(button).toBeDisabled();
    expect(button).toHaveStyle('cursor: not-allowed');
  });

  it('disabled 상태일 때 클릭이 작동하지 않는다', () => {
    render(
      <TodoCheckButton
        todoId="todo-1"
        isCompleted={false}
        disabled={true}
        onToggle={mockOnToggle}
      />
    );

    fireEvent.click(screen.getByLabelText('완료 처리'));

    expect(mockOnToggle).not.toHaveBeenCalled();
  });
});
