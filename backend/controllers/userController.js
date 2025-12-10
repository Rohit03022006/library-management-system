import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import User from '../models/User.js';
import BorrowRecord from '../models/BorrowRecord.js';
import { userSchema, updateUserSchema } from '../schemas/userSchema.js';

const buildAvatarData = (req, file) => {
  if (!file) return undefined;
  const filename = file.filename || path.basename(file.path);
  const publicPath = `/uploads/${filename}`;
  const absoluteUrl = `${req.protocol}://${req.get('host')}${publicPath}`;

  return {
    url: absoluteUrl,
    thumbnailUrl: absoluteUrl,
    publicId: filename
  };
};

const deleteExistingAvatar = (avatar) => {
  if (!avatar?.publicId) return;

  const existingPath = path.resolve('uploads', avatar.publicId);
  fs.promises.access(existingPath, fs.constants.F_OK)
    .then(() => fs.promises.unlink(existingPath))
    .catch(() => null);
};

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { membershipId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }

    const users = await User.find(query)
      .select('-password') // Exclude password
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Error fetching user' });
  }
};


export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const borrowHistory = await BorrowRecord.find({ user: req.params.id })
      .populate('book', 'title author isbn')
      .sort({ borrowDate: -1 });

    res.json({
      user,
      borrowHistory
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentBorrows = await BorrowRecord.find({
      user: req.user.id,
      status: 'borrowed'
    }).populate('book', 'title author isbn dueDate');

    const borrowHistory = await BorrowRecord.find({ user: req.user.id })
      .populate('book', 'title author isbn')
      .sort({ borrowDate: -1 });

    res.json({
      user,
      currentBorrows,
      borrowHistory
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updatePayload = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      isActive: req.body.isActive
    };

    if (req.file) {
      const newAvatar = buildAvatarData(req, req.file);
      const userDoc = await User.findById(req.params.id);
      if (!userDoc) {
        return res.status(404).json({ error: 'User not found' });
      }
      deleteExistingAvatar(userDoc.avatar);
      updatePayload.avatar = newAvatar;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error updating user' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const validationPayload = { ...req.body };
    delete validationPayload.avatar; 

    const { error } = updateUserSchema.validate(validationPayload);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { password, role, ...updateData } = req.body;

    if (req.file) {
      const newAvatar = buildAvatarData(req, req.file);
      const currentUser = await User.findById(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      deleteExistingAvatar(currentUser.avatar);
      updateData.avatar = newAvatar;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Error updating profile' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deactivated successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Error deactivating user' });
  }
};

export const activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User activated successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Error activating user' });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const librarianUsers = await User.countDocuments({ role: 'librarian' });
    const memberUsers = await User.countDocuments({ role: 'member' });

    const usersWithActiveBorrows = await BorrowRecord.distinct('user', {
      status: 'borrowed'
    });

    res.json({
      totalUsers,
      activeUsers,
      adminUsers,
      librarianUsers,
      memberUsers,
      usersWithActiveBorrows: usersWithActiveBorrows.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user stats' });
  }
};

export const getUserQR = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const qrCode = await QRCode.toBuffer(user.generateQRData());
    
    res.set('Content-Type', 'image/png');
    res.send(qrCode);
  } catch (error) {
    res.status(500).json({ error: 'Error generating QR code' });
  }
};