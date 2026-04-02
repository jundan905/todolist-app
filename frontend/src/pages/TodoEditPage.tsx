import { useParams, useNavigate } from 'react-router-dom';
import { useTodoDetail } from '../hooks/useTodoDetail';
import { TodoEditForm } from '../components/todo/TodoEditForm';
import { Spinner } from '../components/common/Spinner';
import { getErrorMessage } from '../utils/errorUtils';

function TodoEditPage() {
  const { todoId } = useParams<{ todoId: string }>();
  const navigate = useNavigate();
  const { data: todo, isLoading, isError, error } = useTodoDetail(todoId ?? '');

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Spinner size={36} />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#C62828', fontSize: '16px' }}>
        {getErrorMessage(error)}
      </div>
    );
  }

  if (!todo) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)', padding: '24px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>할일 수정</h1>
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '28px',
          }}
        >
          <TodoEditForm
            todo={todo}
            onSuccess={() => void navigate(`/todos/${todo.id}`)}
            onCancel={() => void navigate(`/todos/${todo.id}`)}
          />
        </div>
      </div>
    </div>
  );
}

export default TodoEditPage;
