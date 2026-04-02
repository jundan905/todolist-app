import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoStatusBadge } from '../TodoStatusBadge';

describe('TodoStatusBadge', () => {
  it('UPCOMING 상태 텍스트 렌더링', () => {
    render(<TodoStatusBadge status="UPCOMING" />);
    expect(screen.getByText('예정')).toBeInTheDocument();
  });

  it('IN_PROGRESS 상태 텍스트 렌더링', () => {
    render(<TodoStatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText('진행 중')).toBeInTheDocument();
  });

  it('COMPLETED 상태 텍스트 렌더링', () => {
    render(<TodoStatusBadge status="COMPLETED" />);
    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  it('LATE_COMPLETED 상태 텍스트 렌더링', () => {
    render(<TodoStatusBadge status="LATE_COMPLETED" />);
    expect(screen.getByText('지연 완료')).toBeInTheDocument();
  });

  it('FAILED 상태 텍스트 렌더링', () => {
    render(<TodoStatusBadge status="FAILED" />);
    expect(screen.getByText('실패')).toBeInTheDocument();
  });
});
