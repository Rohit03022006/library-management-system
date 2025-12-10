import express from 'express';
import { 
  createBook, 
  getBooks, 
  getBookById, 
  updateBook, 
  deleteBook,
  updateBookCover,
  getBookLocationQR,
  getBookAnalytics,
  advancedSearch
} from '../controllers/bookController.js';
import { auth, authorize } from '../middleware/auth.js';
import { validateBook } from '../middleware/validation.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getBooks);
router.get('/search', advancedSearch);
router.get('/:id', getBookById);
router.get('/:id/qr-code', getBookLocationQR);
router.get('/analytics/overview', auth, authorize('admin', 'librarian'), getBookAnalytics);
router.post('/', auth, authorize('admin', 'librarian'), upload.single('coverImage'), validateBook, createBook);
router.put('/:id', auth, authorize('admin', 'librarian'), validateBook, updateBook);
router.patch('/:id/cover', auth, authorize('admin', 'librarian'), upload.single('coverImage'), updateBookCover);
router.delete('/:id', auth, authorize('admin'), deleteBook);

export default router;