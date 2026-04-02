export type TodoStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'LATE_COMPLETED' | 'FAILED';
export type TodoStatusFilter = TodoStatus | 'CLOSED';
export type SortBy = 'startDate' | 'dueDate' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface TodoItem {
  id: string; userId: string; title: string; description: string | null;
  startDate: string; dueDate: string; isCompleted: boolean; completedAt: string | null;
  status: TodoStatus; createdAt: string; updatedAt: string;
}
export interface CreateTodoInput { title: string; description?: string; startDate: string; dueDate: string; }
export interface UpdateTodoInput { title?: string; description?: string; startDate?: string; dueDate?: string; }
export interface TodoFilters { page?: number; limit?: number; status?: TodoStatusFilter; sortBy?: SortBy; sortOrder?: SortOrder; }
