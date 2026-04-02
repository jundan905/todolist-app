import { describe, it, expect } from 'vitest';
import { formatDate, compareDates, getTodayString } from '../dateUtils';

describe('formatDate', () => {
  it('YYYY-MM-DD를 YYYY년 MM월 DD일 형식으로 변환', () => {
    expect(formatDate('2026-04-01')).toBe('2026년 04월 01일');
  });

  it('월과 일이 한 자리일 때도 올바르게 변환', () => {
    expect(formatDate('2026-01-05')).toBe('2026년 01월 05일');
  });
});

describe('compareDates', () => {
  it('dateA < dateB → -1 반환', () => {
    expect(compareDates('2026-01-01', '2026-12-31')).toBe(-1);
  });

  it('dateA === dateB → 0 반환', () => {
    expect(compareDates('2026-06-15', '2026-06-15')).toBe(0);
  });

  it('dateA > dateB → 1 반환', () => {
    expect(compareDates('2026-12-31', '2026-01-01')).toBe(1);
  });
});

describe('getTodayString', () => {
  it('오늘 날짜를 YYYY-MM-DD 형식으로 반환', () => {
    const result = getTodayString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('반환된 날짜가 실제 오늘 날짜와 일치', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(getTodayString()).toBe(expected);
  });
});
