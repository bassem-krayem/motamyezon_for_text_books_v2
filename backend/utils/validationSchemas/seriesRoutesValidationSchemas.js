import Joi from 'joi';

// ==========================================
// 📚 SERIES ROUTE SCHEMAS
// ==========================================

// 1. POST / (Admin create series)
export const createSeriesSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    name: Joi.string().trim().required().messages({
      'any.required': 'Series name is required',
      'string.empty': 'Series name cannot be empty',
    }),
    description: Joi.string().trim().optional(),
    author: Joi.string().trim().required().messages({
      'any.required': 'Author ID is required to link this series',
      'string.empty': 'Author ID cannot be empty',
    }),
  }).unknown(false), // Rejects unauthorized properties cleanly
});

// 2. PATCH /:id (Admin/Uploader update series)
export const updateSeriesSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(), // Open for custom ID architectures
  body: Joi.object({
    name: Joi.string().trim().optional(),
    description: Joi.string().trim().optional().allow(null, ''),
    author: Joi.string().trim().optional(),
  }).unknown(false),
});
