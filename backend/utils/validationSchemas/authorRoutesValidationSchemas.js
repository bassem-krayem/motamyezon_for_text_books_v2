import Joi from 'joi';

// ==========================================
// ✍️ AUTHOR ROUTE SCHEMAS
// ==========================================

// 1. POST / (Admin create author)
export const createAuthorSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    name: Joi.string().trim().required().messages({
      'any.required': 'Author name is required',
      'string.empty': 'Author name cannot be empty',
    }),
    bio: Joi.string().trim().optional(),
  }).unknown(false), // Rejects unexpected keys cleanly
});

// 2. PATCH /:id (Admin/Uploader update author)
export const updateAuthorSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(), // Open for custom ID configurations
  body: Joi.object({
    name: Joi.string().trim().optional(),
    bio: Joi.string().trim().optional(),
  }).unknown(false), // Rejects unauthorized properties
});
