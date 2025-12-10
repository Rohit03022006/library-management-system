import Joi from 'joi';

const avatarSchema = Joi.object({
  url: Joi.string().uri().required(),
  thumbnailUrl: Joi.string().uri().required(),
  publicId: Joi.string().required()
});

export const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.empty': 'Password is required'
  }),
  role: Joi.string().valid('admin', 'librarian', 'member').default('member'),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).messages({
    'string.pattern.base': 'Phone number must be 10-15 digits'
  }),
  address: Joi.string().max(200),
  avatar: Joi.alternatives().try(
    Joi.string().uri().allow('', null),
    avatarSchema
  ).messages({
    'string.uri': 'Avatar must be a valid URL'
  })
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  role: Joi.string().valid('admin', 'librarian', 'member'),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/),
  address: Joi.string().max(200),
  avatar: Joi.alternatives().try(
    Joi.string().uri().allow('', null),
    avatarSchema
  ),
  isActive: Joi.boolean()
  
}).min(1);