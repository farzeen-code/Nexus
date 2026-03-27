import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  logout,
  forgotPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { registerValidation, loginValidation, validate } from '../middleware/validator.js';


const router = express.Router();



// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

export default router;