import type { TodoStatus } from '../types/todo.types';

export function computeTodoStatus(
  startDate: string,
  dueDate: string,
  isCompleted: boolean,
  completedAt: string | null
): TodoStatus {
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00');
  const start = new Date(startDate + 'T00:00:00');
  const due = new Date(dueDate + 'T00:00:00');

  if (isCompleted && completedAt !== null) {
    const completed = new Date(completedAt);
    const completedDay = new Date(
      completed.getFullYear() + '-' +
      String(completed.getMonth() + 1).padStart(2, '0') + '-' +
      String(completed.getDate()).padStart(2, '0') + 'T00:00:00'
    );
    if (completedDay <= due) {
      return 'COMPLETED';
    } else {
      return 'LATE_COMPLETED';
    }
  }

  if (today < start) {
    return 'UPCOMING';
  }

  if (start <= today && today <= due && !isCompleted) {
    return 'IN_PROGRESS';
  }

  return 'FAILED';
}
