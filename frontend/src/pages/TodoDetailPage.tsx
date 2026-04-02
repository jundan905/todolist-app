import { useParams } from 'react-router-dom';
import { useTodoDetail } from '../hooks/useTodoDetail';
import { TodoDetail } from '../components/todo/TodoDetail';
import { Spinner } from '../components/common/Spinner';
import { getErrorMessage } from '../utils/errorUtils';
import axios from 'axios';

function TodoDetailPage() {
  const { todoId } = useParams<{ todoId: string }>();
  const { data: todo, isLoading, isError, error } = useTodoDetail(todoId ?? '');

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Spinner size={36} />
      </div>
    );
  }

  if (isError) {
    const is403 = axios.isAxiosError(error) && error.response?.status === 403;
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#C62828', fontSize: '16px' }}>
        {is403 ? '접근 권한이 없습니다.' : getErrorMessage(error)}
      </div>
    );
  }

  if (!todo) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)', padding: '24px' }}>
      <TodoDetail todo={todo} />
    </div>
  );
}

export default TodoDetailPage;
