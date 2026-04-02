import type { TodoStatus } from '../types/todo.types';

export function computeTodoStatus(
  startDate: string,
  dueDate: string,
  isCompleted: boolean,
  completedAt: string | null
): TodoStatus {
  // ISO 날짜 문자열을 Date 객체로 변환 (UTC 기준)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(23, 59, 59, 999); // 종료일은 하루 끝까지 유효

  if (isCompleted && completedAt !== null) {
    const completed = new Date(completedAt);
    // 완료일이 dueDate 이내이면 COMPLETED, 초과하면 LATE_COMPLETED
    if (completed <= due) {
      return 'COMPLETED';
    } else {
      return 'LATE_COMPLETED';
    }
  }

  // 미완료 상태
  if (today < start) {
    return 'UPCOMING';
  }

  if (today <= due && !isCompleted) {
    return 'IN_PROGRESS';
  }

  return 'FAILED';
}
