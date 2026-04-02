import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute, PublicRoute } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toast } from './components/common/Toast';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TodoListPage from './pages/TodoListPage';
import TodoDetailPage from './pages/TodoDetailPage';
import TodoEditPage from './pages/TodoEditPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/todos" replace />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />
        <Route
          path="/todos"
          element={
            <PrivateRoute>
              <TodoListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/todos/:todoId"
          element={
            <PrivateRoute>
              <TodoDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/todos/:todoId/edit"
          element={
            <PrivateRoute>
              <TodoEditPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toast />
    </ErrorBoundary>
  );
}

export default App;
