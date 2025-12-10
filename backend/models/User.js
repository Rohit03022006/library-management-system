import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'librarian', 'member'],
    default: 'member'
  },
  membershipId: {
    type: String,
    unique: true
  },
  phone: String,
  address: String,
  avatar: {
    url: String,
    publicId: String,
    thumbnailUrl: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateQRData = function() {
  return JSON.stringify({
    type: 'user',
    id: this._id,
    name: this.name,
    email: this.email,
    membershipId: this.membershipId,
    role: this.role,
    phone: this.phone || '',
    address: this.address || ''
  });
};

export default mongoose.model('User', userSchema);