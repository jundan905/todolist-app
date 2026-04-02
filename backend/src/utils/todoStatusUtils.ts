import { TodoStatus } from '../types/todo.types';

const toMidnightUTCString = (date: Date): string => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
};

export const computeTodoStatus = (
  isCompleted: boolean,
  completedAt: Date | null,
  startDate: string,   // YYYY-MM-DD
  dueDate: string,     // YYYY-MM-DD
): TodoStatus => {
  const todayStr = toMidnightUTCString(new Date());

  if (isCompleted && completedAt) {
    const completedStr = toMidnightUTCString(completedAt);
    return completedStr <= dueDate ? 'COMPLETED' : 'LATE_COMPLETED';
  }
  if (todayStr < startDate) return 'UPCOMING';
  if (todayStr <= dueDate) return 'IN_PROGRESS';
  return 'FAILED';
};
