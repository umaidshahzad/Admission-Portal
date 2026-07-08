import { Router } from 'express';
import { 
  getPrograms, 
  getProgramById, 
  createProgram, 
  updateProgram, 
  deleteProgram 
} from '../controllers/programController.ts';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.ts';

const router = Router();

// ==========================================
// 1. PUBLIC / APPLICANT BROWSE ENDPOINTS
// ==========================================
router.get('/', getPrograms);
router.get('/:id', getProgramById);

// ==========================================
// 2. PRIVILEGED STAFF ENDPOINTS (ADMIN & DEPT_HEAD)
// ==========================================
router.post('/', authenticateToken, requireRole(['admin', 'dept_head']), createProgram);
router.put('/:id', authenticateToken, requireRole(['admin', 'dept_head']), updateProgram);
router.delete('/:id', authenticateToken, requireRole(['admin', 'dept_head']), deleteProgram);

export default router;
