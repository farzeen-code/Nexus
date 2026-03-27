import express from 'express';
import { createTransaction, getUserTransactions, getBalance } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/transaction', createTransaction);
router.get('/transactions', getUserTransactions);
router.get('/balance', getBalance);

export default router;