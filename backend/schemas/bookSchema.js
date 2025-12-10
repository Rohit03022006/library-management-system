import Joi from 'joi';

const currentYear = new Date().getFullYear();

export const bookSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  author: Joi.string().min(1).max(100).required(),
  isbn: Joi.string().min(10).max(13).required(),
  genre: Joi.string().required(),
  publishedYear: Joi.number().integer().min(1000).max(currentYear),

  publisher: Joi.string().max(100).allow('', null),
  description: Joi.string().max(1000).allow('', null),
  totalCopies: Joi.number().integer().min(1).required(),
  availableCopies: Joi.number().integer().min(0).max(Joi.ref('totalCopies')),

  location: Joi.object({
    shelf: Joi.string().max(50).allow('', null),
    row: Joi.number().integer().min(0).allow(null),
    position: Joi.number().integer().min(0).allow(null),
    section: Joi.string().max(50).allow('', null)
  }).optional(),
  status: Joi.string().valid('available', 'unavailable', 'maintenance'),
  language: Joi.string().max(50).allow('', null),
  edition: Joi.string().max(50).allow('', null),
  pages: Joi.number().integer().min(1).allow(null),
  tags: Joi.array().items(Joi.string().max(50))
});