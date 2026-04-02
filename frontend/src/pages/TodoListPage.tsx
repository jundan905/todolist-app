import { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { logout } from '../api/authApi';
import { Modal } from '../components/common/Modal';
import { TodoFilter } from '../components/todo/TodoFilter';
import { TodoList } from '../components/todo/TodoList';
import { TodoForm } from '../components/todo/TodoForm';
import type { TodoFilters } from '../types/todo.types';
import { useToastStore } from '../components/common/Toast';

function TodoListPage() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { addToast } = useToastStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<TodoFilters>({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // 로그아웃 API 실패해도 클라이언트 상태는 초기화
    }
    clearAuth();
    window.location.href = '/login';
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      <header
        style={{
          background: 'var(--surface-card)',
          borderBottom: '1px solid var(--border-default)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
        }}
      >
        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--brand-primary)' }}>
          todolist-app
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: 'var(--neutral-700)' }}>
            {user?.name ?? '사용자'}
          </span>
          <button
            type="button"
            onClick={() => void handleLogout()}
            style={{
              padding: '6px 14px',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--neutral-700)',
            }}
          >
            로그아웃
          </button>
        </div>
      </header>
      <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>할일 목록</h1>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '10px 18px',
              background: 'var(--brand-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            + 할일 추가
          </button>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <TodoFilter filters={filters} onChange={setFilters} />
        </div>
        <TodoList
          filters={filters}
          onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        />
      </main>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="할일 추가"
      >
        <TodoForm
          onSuccess={() => {
            setIsModalOpen(false);
            addToast('할일이 추가되었습니다.', 'success');
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default TodoListPage;
