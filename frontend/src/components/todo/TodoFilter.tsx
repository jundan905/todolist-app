import type { TodoFilters, TodoStatusFilter, SortBy, SortOrder } from '../../types/todo.types';

interface TodoFilterProps {
  filters: TodoFilters;
  onChange: (filters: TodoFilters) => void;
}

const selectStyle: React.CSSProperties = {
  padding: '8px 10px',
  border: '1px solid var(--border-default)',
  borderRadius: '6px',
  fontSize: '14px',
  background: 'var(--surface-card)',
  color: 'var(--neutral-900)',
};

export function TodoFilter({ filters, onChange }: TodoFilterProps) {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <select
        value={filters.status ?? ''}
        onChange={(e) => onChange({ ...filters, status: (e.target.value as TodoStatusFilter) || undefined, page: 1 })}
        style={selectStyle}
        aria-label="상태 필터"
      >
        <option value="">전체</option>
        <option value="UPCOMING">예정</option>
        <option value="IN_PROGRESS">진행 중</option>
        <option value="COMPLETED">완료</option>
        <option value="LATE_COMPLETED">지연 완료</option>
        <option value="FAILED">실패</option>
        <option value="CLOSED">종료</option>
      </select>
      <select
        value={filters.sortBy ?? 'createdAt'}
        onChange={(e) => onChange({ ...filters, sortBy: e.target.value as SortBy })}
        style={selectStyle}
        aria-label="정렬 기준"
      >
        <option value="createdAt">생성일</option>
        <option value="startDate">시작일</option>
        <option value="dueDate">종료일</option>
      </select>
      <select
        value={filters.sortOrder ?? 'desc'}
        onChange={(e) => onChange({ ...filters, sortOrder: e.target.value as SortOrder })}
        style={selectStyle}
        aria-label="정렬 방향"
      >
        <option value="desc">내림차순</option>
        <option value="asc">오름차순</option>
      </select>
      <select
        value={filters.limit ?? 20}
        onChange={(e) => onChange({ ...filters, limit: Number(e.target.value), page: 1 })}
        style={selectStyle}
        aria-label="페이지당 항목 수"
      >
        <option value={20}>20개</option>
        <option value={50}>50개</option>
        <option value={100}>100개</option>
      </select>
    </div>
  );
}
