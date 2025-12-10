import express from 'express';
import {
  getUsers,
  getUserById,
  getProfile,
  updateUser,
  updateProfile,
  deleteUser,
  deactivateUser,
  activateUser,
  getUserStats,
  getUserQR
} from '../controllers/userController.js';
import { auth, authorize } from '../middleware/auth.js';
import { validateUserUpdate } from '../middleware/validation.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, upload.single('avatar'), validateUserUpdate, updateProfile);

router.get('/', auth, authorize('admin', 'librarian'), getUsers);
router.get('/stats', auth, authorize('admin', 'librarian'), getUserStats);
router.get('/:id', auth, authorize('admin', 'librarian'), getUserById);
router.put('/:id', auth, authorize('admin', 'librarian'), upload.single('avatar'), validateUserUpdate, updateUser);

router.delete('/:id', auth, authorize('admin', 'librarian'), deleteUser);
router.patch('/:id/deactivate', auth, authorize('admin','librarian'), deactivateUser);
router.patch('/:id/activate', auth, authorize('admin', 'librarian'), activateUser);
router.get('/:id/qr-code', auth, authorize('admin', 'librarian'), getUserQR);

export default router;