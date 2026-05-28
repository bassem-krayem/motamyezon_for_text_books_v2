import Joi from 'joi';

// Helper to safely handle form-data text fields containing array strings or raw structures
const categoriesCustomParser = (value, helpers) => {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      return [value];
    }
  }
  if (Array.isArray(value)) return value;
  return helpers.error('any.invalid');
};

// ==========================================
// 📚 BOOK ROUTE SCHEMAS
// ==========================================

// 1. POST / (Admin/Uploader create book with multipart data)
export const createBookSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),

  // Validate that the Multer middleware successfully attached the file buffers
  files: Joi.object({
    epub: Joi.array().items(Joi.object().required()).required().messages({
      'any.required': 'EPUB format book file is required',
    }),
    azw3: Joi.array().items(Joi.object().required()).required().messages({
      'any.required': 'AZW3 format book file is required',
    }),
    kfx: Joi.array().items(Joi.object().required()).required().messages({
      'any.required': 'KFX format book file is required',
    }),
  })
    .required()
    .messages({
      'any.required':
        'All three file formats are required: epub, azw3, and kfx',
    }),

  body: Joi.object({
    title: Joi.string().trim().required().messages({
      'any.required': 'Book title is required',
      'string.empty': 'Book title cannot be empty',
    }),
    description: Joi.string().trim().optional(),
    author: Joi.string().trim().required().messages({
      'any.required': 'Author ID is required for this book',
    }),
    categories: Joi.custom(categoriesCustomParser).required().messages({
      'any.required': 'At least one category is required',
    }),
    series: Joi.string().trim().optional(),
  }).unknown(false), // Rejects extra form fields cleanly
});

// 2. PATCH /:id (Admin/Uploader update book metadata)
export const updateBookSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    title: Joi.string().trim().optional(),
    description: Joi.string().trim().optional(),
    author: Joi.string().trim().optional(),
    categories: Joi.custom(categoriesCustomParser).optional(),
    series: Joi.string().trim().optional().allow(null, ''),
  }).unknown(false),
});

export const getAllBooksSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(50).optional(),
    sort: Joi.string().optional(),
    fields: Joi.string().optional(),
    // Add other filter params as needed
  }),
  body: Joi.object(),
  params: Joi.object(),
});
