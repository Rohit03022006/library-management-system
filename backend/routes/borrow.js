import express from 'express';
import { borrowBook, returnBook, getBorrowRecords } from '../controllers/borrowController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getBorrowRecords);
router.post('/', auth, authorize('admin', 'librarian'), borrowBook);
router.patch('/:borrowId/return', auth, authorize('admin', 'librarian'), returnBook);

export default router;