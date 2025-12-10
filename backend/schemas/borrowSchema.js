import Joi from 'joi';

export const borrowSchema = Joi.object({
  userId: Joi.string().required(),
  bookId: Joi.string().required(),
  dueDate: Joi.date().greater('now').required()
});