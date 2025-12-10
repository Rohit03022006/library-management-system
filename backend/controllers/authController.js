import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { registerSchema, loginSchema } from '../schemas/authSchema.js';

const buildAvatarData = (req) => {
  if (!req?.file) return undefined;

  const filename = req.file.filename || req.file.originalname;
  const publicPath = `/uploads/${filename}`;
  const absoluteUrl = `${req.protocol}://${req.get('host')}${publicPath}`;

  return {
    url: absoluteUrl,
    thumbnailUrl: absoluteUrl,
    publicId: filename
  };
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'library_secret', {
    expiresIn: '7d'
  });
};

export const register = async (req, res) => {
  try {
    console.log('Registration request body:', req.body); 
    const payload = req.body || {};
    const { error } = registerSchema.validate(payload);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password, role, phone, address } = payload;
    const avatar = buildAvatarData(req);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'member',
      phone,
      address,
      membershipId: `MEM${Date.now()}`,
      ...(avatar && { avatar })
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipId: user.membershipId,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipId: user.membershipId,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
};