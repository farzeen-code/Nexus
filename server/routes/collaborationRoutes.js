import express from 'express';
import {
  createCollaborationRequest,
  getCollaborationRequests,
  getCollaborationById,
  updateCollaborationStatus,
  deleteCollaborationRequest
} from '../controllers/collaborationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCollaborationRequests)
  .post(createCollaborationRequest);

router.route('/:id')
  .get(getCollaborationById)
  .delete(deleteCollaborationRequest);

router.put('/:id/status', updateCollaborationStatus);

export default router;