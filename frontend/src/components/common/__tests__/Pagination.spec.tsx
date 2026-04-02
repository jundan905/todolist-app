import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../Pagination';
import type { PaginationMeta } from '../../../types/api.types';

function makePagination(overrides: Partial<PaginationMeta> = {}): PaginationMeta {
  return {
    page: 1,
    limit: 20,
    total: 40,
    totalPages: 2,
    hasNextPage: true,
    hasPrevPage: false,
    ...overrides,
  };
}

describe('Pagination', () => {
  it('hasPrevPage=false 시 이전 버튼이 비활성화된다', () => {
    render(<Pagination pagination={makePagination({ hasPrevPage: false })} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: '이전' })).toBeDisabled();
  });

  it('hasNextPage=false 시 다음 버튼이 비활성화된다', () => {
    render(<Pagination pagination={makePagination({ hasNextPage: false, hasPrevPage: true, page: 2 })} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled();
  });

  it('다음 버튼 클릭 시 page+1로 콜백 호출', () => {
    const onPageChange = vi.fn();
    render(<Pagination pagination={makePagination({ page: 1, hasNextPage: true })} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('이전 버튼 클릭 시 page-1로 콜백 호출', () => {
    const onPageChange = vi.fn();
    render(<Pagination pagination={makePagination({ page: 2, hasPrevPage: true, hasNextPage: false })} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole('button', { name: '이전' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('현재 페이지와 전체 페이지 수가 표시된다', () => {
    render(<Pagination pagination={makePagination({ page: 1, totalPages: 5 })} onPageChange={vi.fn()} />);
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
  });
});
