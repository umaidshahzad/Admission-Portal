import { Router } from 'express';
import { 
  register, 
  login, 
  getMe, 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/authController.ts';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.ts';

const router = Router();

// ==========================================
// 1. PUBLIC AUTHENTICATION ROUTES
// ==========================================
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);

// ==========================================
// 2. ADMINISTRATOR-ONLY USER CRUD ENDPOINTS
// ==========================================
router.get('/users', authenticateToken, requireRole(['admin']), getUsers);
router.post('/users', authenticateToken, requireRole(['admin']), createUser);
router.put('/users/:id', authenticateToken, requireRole(['admin']), updateUser);
router.delete('/users/:id', authenticateToken, requireRole(['admin']), deleteUser);

export default router;
