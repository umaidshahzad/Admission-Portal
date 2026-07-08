import { Router } from 'express';
import multer from 'multer';
import { 
  apply, 
  getMyApplications, 
  getApplications, 
  verifyDocuments, 
  updateTestScores, 
  generateMeritList 
} from '../controllers/applicationController.ts';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.ts';

const router = Router();

// Configure Multer for processing file uploads in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadFields = upload.fields([
  { name: 'sscTranscript', maxCount: 1 },
  { name: 'hsscTranscript', maxCount: 1 },
  { name: 'bachelorsTranscript', maxCount: 1 },
  { name: 'mastersTranscript', maxCount: 1 },
  { name: 'researchProposal', maxCount: 1 }
]);

// ==========================================
// 1. APPLICANT ENDPOINTS
// ==========================================
router.post('/apply', authenticateToken, requireRole(['applicant']), uploadFields, apply);
router.get('/my-applications', authenticateToken, requireRole(['applicant']), getMyApplications);

// ==========================================
// 2. READ-ALL ENDPOINT FOR PRIVILEGED ROLES
// ==========================================
router.get('/', authenticateToken, requireRole(['admin', 'officer', 'dept_head']), getApplications);

// ==========================================
// 3. ADMISSIONS OFFICER ENDPOINTS
// ==========================================
router.put('/:id/verify', authenticateToken, requireRole(['officer', 'admin']), verifyDocuments);

// ==========================================
// 4. DEPARTMENT HEAD & ADMIN ENDPOINTS
// ==========================================
router.put('/:id/test-scores', authenticateToken, requireRole(['dept_head', 'admin']), updateTestScores);
router.post('/generate-merit-list/:programId', authenticateToken, requireRole(['dept_head', 'admin']), generateMeritList);

export default router;
