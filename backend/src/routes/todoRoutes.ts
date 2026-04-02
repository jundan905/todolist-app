import { Router } from 'express';
import {
  handleCreateTodo,
  handleGetTodos,
  handleGetTodoById,
  handleUpdateTodo,
  handleCompleteTodo,
} from '../controllers/todoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// 모든 Todo 라우트는 인증 필요
router.use(authMiddleware);

router.post('/', handleCreateTodo);
router.get('/', handleGetTodos);
router.get('/:todoId', handleGetTodoById);
router.patch('/:todoId', handleUpdateTodo);
router.patch('/:todoId/complete', handleCompleteTodo);

export default router;
