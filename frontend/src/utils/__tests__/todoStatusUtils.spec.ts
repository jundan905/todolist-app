import { describe, it, expect, vi, beforeEach } from 'vitest';
import { computeTodoStatus } from '../todoStatusUtils';

describe('computeTodoStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-02T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // COMPLETED: 완료일이 dueDate 이내
  describe('COMPLETED 상태', () => {
    it('isCompleted=true 이고 completedAt 이 dueDate 와 같으면 COMPLETED', () => {
      expect(computeTodoStatus('2026-03-01', '2026-03-31', true, '2026-03-31T10:00:00.000Z')).toBe('COMPLETED');
    });

    it('isCompleted=true 이고 completedAt 이 dueDate 이전이면 COMPLETED', () => {
      expect(computeTodoStatus('2026-03-01', '2026-03-31', true, '2026-03-20T10:00:00.000Z')).toBe('COMPLETED');
    });

    it('isCompleted=true 이고 completedAt 이 dueDate 전날이면 COMPLETED', () => {
      expect(computeTodoStatus('2026-03-01', '2026-03-31', true, '2026-03-30T23:59:59.000Z')).toBe('COMPLETED');
    });

    it('isCompleted=true 이고 completedAt 이 startDate 와 같으면 COMPLETED', () => {
      expect(computeTodoStatus('2026-03-01', '2026-03-31', true, '2026-03-01T10:00:00.000Z')).toBe('COMPLETED');
    });
  });

  // LATE_COMPLETED: 완료일이 dueDate 초과
  describe('LATE_COMPLETED 상태', () => {
    it('isCompleted=true 이고 completedAt 이 dueDate 이후이면 LATE_COMPLETED', () => {
      expect(computeTodoStatus('2026-03-01', '2026-03-31', true, '2026-04-01T10:00:00.000Z')).toBe('LATE_COMPLETED');
    });

    it('isCompleted=true 이고 completedAt 이 dueDate 보다 훨씬 이후이면 LATE_COMPLETED', () => {
      expect(computeTodoStatus('2026-03-01', '2026-03-10', true, '2026-04-02T00:00:00.000Z')).toBe('LATE_COMPLETED');
    });

    it('isCompleted=true 이고 completedAt 이 dueDate 다음날이면 LATE_COMPLETED', () => {
      expect(computeTodoStatus('2026-03-01', '2026-03-31', true, '2026-04-01T00:00:00.000Z')).toBe('LATE_COMPLETED');
    });
  });

  // UPCOMING: 오늘이 startDate 이전
  describe('UPCOMING 상태', () => {
    it('오늘이 startDate 이전이면 UPCOMING', () => {
      expect(computeTodoStatus('2026-04-10', '2026-12-31', false, null)).toBe('UPCOMING');
    });

    it('startDate 가 미래인 경우 UPCOMING', () => {
      expect(computeTodoStatus('2027-06-01', '2027-06-30', false, null)).toBe('UPCOMING');
    });

    it('오늘이 startDate 전날이면 UPCOMING', () => {
      expect(computeTodoStatus('2026-04-03', '2026-04-10', false, null)).toBe('UPCOMING');
    });

    it('startDate 가 매우 먼 미래이면 UPCOMING', () => {
      expect(computeTodoStatus('2030-01-01', '2030-12-31', false, null)).toBe('UPCOMING');
    });
  });

  // IN_PROGRESS: startDate <= 오늘 <= dueDate, 미완료
  describe('IN_PROGRESS 상태', () => {
    it('오늘이 startDate 와 dueDate 사이이면 IN_PROGRESS', () => {
      expect(computeTodoStatus('2026-04-01', '2026-04-10', false, null)).toBe('IN_PROGRESS');
    });

    it('오늘이 startDate 와 같고 dueDate 가 미래이면 IN_PROGRESS', () => {
      expect(computeTodoStatus('2026-04-02', '2026-04-10', false, null)).toBe('IN_PROGRESS');
    });

    it('오늘이 dueDate 와 같고 startDate 가 과거이면 IN_PROGRESS', () => {
      expect(computeTodoStatus('2026-04-01', '2026-04-02', false, null)).toBe('IN_PROGRESS');
    });

    it('오늘이 startDate 이면서 dueDate 와 같으면 IN_PROGRESS', () => {
      expect(computeTodoStatus('2026-04-02', '2026-04-02', false, null)).toBe('IN_PROGRESS');
    });

    it('시작일과 종료일이 오늘이고 미완료이면 IN_PROGRESS', () => {
      expect(computeTodoStatus('2026-04-02', '2026-04-02', false, null)).toBe('IN_PROGRESS');
    });
  });

  // FAILED: 오늘이 dueDate 초과, 미완료
  describe('FAILED 상태', () => {
    it('오늘이 dueDate 를 초과하고 미완료이면 FAILED', () => {
      expect(computeTodoStatus('2026-01-01', '2026-01-31', false, null)).toBe('FAILED');
    });

    it('과거 날짜이고 미완료이면 FAILED', () => {
      expect(computeTodoStatus('2025-01-01', '2025-06-30', false, null)).toBe('FAILED');
    });

    it('오늘이 dueDate 다음날이고 미완료이면 FAILED', () => {
      expect(computeTodoStatus('2026-04-01', '2026-04-01', false, null)).toBe('FAILED');
    });

    it('dueDate 가 어제이고 미완료이면 FAILED', () => {
      expect(computeTodoStatus('2026-03-01', '2026-04-01', false, null)).toBe('FAILED');
    });

    it('isCompleted=false 이고 startDate 가 dueDate 와 같고 과거이면 FAILED', () => {
      expect(computeTodoStatus('2026-01-15', '2026-01-15', false, null)).toBe('FAILED');
    });
  });

  // 경계 케이스: isCompleted=true 이지만 completedAt=null 처리
  describe('경계 케이스', () => {
    it('isCompleted=true 이지만 completedAt 이 null 이면 날짜 기반으로 폴백', () => {
      // 이 케이스는 현재 구현에서 completedAt null 체크 후 바로 날짜 비교로 넘어감
      // 오늘 (2026-04-02) 기준으로 startDate=2026-04-01, dueDate=2026-04-01 이면 FAILED
      expect(computeTodoStatus('2026-04-01', '2026-04-01', true, null)).toBe('FAILED');
    });

    it('isCompleted=false 이고 completedAt 이 있는 경우 (비정상) - 날짜 기반으로 폴백', () => {
      expect(computeTodoStatus('2026-04-01', '2026-04-10', false, '2026-04-05T10:00:00.000Z')).toBe('IN_PROGRESS');
    });

    it('startDate 와 dueDate 가 모두 과거이고 isCompleted=false 이면 FAILED', () => {
      expect(computeTodoStatus('2025-01-01', '2025-12-31', false, null)).toBe('FAILED');
    });

    it('startDate 와 dueDate 가 모두 미래이고 isCompleted=false 이면 UPCOMING', () => {
      expect(computeTodoStatus('2027-01-01', '2027-12-31', false, null)).toBe('UPCOMING');
    });
  });

  // 시간대 경계 테스트
  describe('시간대 경계 테스트', () => {
    it('자정 직전 완료 (23:59:59) - 당일 마감', () => {
      // dueDate 가 2026-04-02 이고, completedAt 이 2026-04-02T23:59:59.000Z 이면
      // UTC 기준이지만 로컬 타임존에서 날짜 추출 시 하루 전일 수 있음
      // 실제 구현은 completedAt 의 로컬 날짜를 사용하므로, 명확한 날짜 비교를 위해 로컬 타임존 기준 사용
      // 테스트에서는 completedAt 을 명시적 로컬 시간대로 전달
      const result = computeTodoStatus('2026-04-01', '2026-04-02', true, '2026-04-02T23:59:59');
      // completedDay=2026-04-02, due=2026-04-02 → COMPLETED
      expect(result).toBe('COMPLETED');
    });

    it('자정 직후 완료 (00:00:00) - 다음날', () => {
      // dueDate 가 2026-04-02 이고, completedAt 이 2026-04-03T00:00:00 이면
      // 날짜 비교 시 completedDay=2026-04-03, due=2026-04-02 로 초과 → LATE_COMPLETED
      expect(computeTodoStatus('2026-04-01', '2026-04-02', true, '2026-04-03T00:00:00')).toBe('LATE_COMPLETED');
    });

    it('시작일 당일 완료 - COMPLETED', () => {
      expect(computeTodoStatus('2026-04-02', '2026-04-10', true, '2026-04-02T10:00:00')).toBe('COMPLETED');
    });
  });
});
