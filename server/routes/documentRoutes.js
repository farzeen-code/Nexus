import express from 'express';
import { uploadDocument, getUserDocuments, signDocument, deleteDocument } from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/upload.js';

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('document'), uploadDocument);
router.get('/', getUserDocuments);
router.put('/:id/sign', signDocument);
router.delete('/:id', deleteDocument);

export default router;