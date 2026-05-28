import Joi from 'joi';

// ==========================================
// 🏷️ CATEGORY ROUTE SCHEMAS
// ==========================================

// 1. POST / (Admin create category)
export const createCategorySchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    name: Joi.string().trim().required().messages({
      'any.required': 'Category name is required',
      'string.empty': 'Category name cannot be empty',
    }),
  }).unknown(false), // Rejects extra keys completely
});

// 2. PATCH /:id (Admin/Uploader update category)
export const updateCategorySchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(), // Open for custom ID handling
  body: Joi.object({
    name: Joi.string().trim().required().messages({
      'any.required': 'Category name is required to execute an update',
      'string.empty': 'Category name cannot be empty',
    }),
  }).unknown(false),
});
