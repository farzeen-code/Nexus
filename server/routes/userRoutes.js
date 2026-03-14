import express from 'express';
import {
  getAllEntrepreneurs,
  getAllInvestors,
  getUserById,
  searchUsers
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// User routes
router.get('/entrepreneurs', getAllEntrepreneurs);
router.get('/investors', getAllInvestors);
router.get('/search', searchUsers);
router.get('/:id', getUserById);

export default router;