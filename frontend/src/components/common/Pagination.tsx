import type { PaginationMeta } from '../../types/api.types';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, hasPrevPage, hasNextPage } = pagination;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage}
        style={{
          padding: '6px 14px',
          border: '1px solid var(--border-default)',
          borderRadius: '6px',
          background: hasPrevPage ? 'var(--surface-card)' : 'var(--neutral-100)',
          color: hasPrevPage ? 'var(--neutral-900)' : 'var(--neutral-300)',
          cursor: hasPrevPage ? 'pointer' : 'not-allowed',
          fontSize: '14px',
        }}
      >
        이전
      </button>
      <span style={{ fontSize: '14px', color: 'var(--neutral-700)' }}>
        {page} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
        style={{
          padding: '6px 14px',
          border: '1px solid var(--border-default)',
          borderRadius: '6px',
          background: hasNextPage ? 'var(--surface-card)' : 'var(--neutral-100)',
          color: hasNextPage ? 'var(--neutral-900)' : 'var(--neutral-300)',
          cursor: hasNextPage ? 'pointer' : 'not-allowed',
          fontSize: '14px',
        }}
      >
        다음
      </button>
    </div>
  );
}
