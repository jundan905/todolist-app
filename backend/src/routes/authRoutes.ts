import { Router } from 'express';
import { handleSignup, handleLogin, handleLogout } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/signup', handleSignup);
router.post('/login', handleLogin);
router.post('/logout', authMiddleware, handleLogout);

export default router;
