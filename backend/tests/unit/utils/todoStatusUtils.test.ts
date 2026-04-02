import { computeTodoStatus } from '../../../src/utils/todoStatusUtils';

describe('computeTodoStatus', () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);
  const dayAfterStr = dayAfter.toISOString().split('T')[0];

  it('COMPLETED: 기한 내 완료', () => {
    expect(computeTodoStatus(true, today, yesterdayStr, todayStr)).toBe('COMPLETED');
  });

  it('LATE_COMPLETED: 기한 후 완료', () => {
    expect(computeTodoStatus(true, today, yesterdayStr, yesterdayStr)).toBe('LATE_COMPLETED');
  });

  it('UPCOMING: 시작일 이전', () => {
    expect(computeTodoStatus(false, null, tomorrowStr, dayAfterStr)).toBe('UPCOMING');
  });

  it('IN_PROGRESS: 시작일~종료일 사이', () => {
    expect(computeTodoStatus(false, null, yesterdayStr, tomorrowStr)).toBe('IN_PROGRESS');
  });

  it('IN_PROGRESS: 시작일 = 오늘', () => {
    expect(computeTodoStatus(false, null, todayStr, tomorrowStr)).toBe('IN_PROGRESS');
  });

  it('IN_PROGRESS: 종료일 = 오늘', () => {
    expect(computeTodoStatus(false, null, yesterdayStr, todayStr)).toBe('IN_PROGRESS');
  });

  it('FAILED: 기한 초과', () => {
    expect(computeTodoStatus(false, null, yesterdayStr, yesterdayStr)).toBe('FAILED');
  });

  it('COMPLETED 경계: completedAt = dueDate', () => {
    const dueDate = new Date(yesterdayStr);
    expect(computeTodoStatus(true, dueDate, yesterdayStr, yesterdayStr)).toBe('COMPLETED');
  });
});
