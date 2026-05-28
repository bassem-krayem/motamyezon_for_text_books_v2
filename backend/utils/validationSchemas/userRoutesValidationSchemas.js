import Joi from 'joi';

// ==========================================
// 👤 USER ROUTE SCHEMAS (Ordered by Route Flow)
// ==========================================

// 1. POST /signup
export const signupSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    firstName: Joi.string().trim().required().messages({
      'any.required': 'First name is required',
      'string.empty': 'First name cannot be empty',
    }),
    lastName: Joi.string().trim().required().messages({
      'any.required': 'Last name is required',
      'string.empty': 'Last name cannot be empty',
    }),
    email: Joi.string().email().required().messages({
      'any.required': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
    password: Joi.string().min(8).required().messages({
      'any.required': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
    }),
    passwordConfirm: Joi.string()
      .required()
      .valid(Joi.ref('password'))
      .messages({
        'any.required': 'Password confirmation is required',
        'any.only': 'Passwords do not match',
      }),
  }),
});

// 2. POST /login
export const loginSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    email: Joi.string().required().messages({
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),
});

// 3. POST /forgotPassword
export const forgotPasswordSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'any.required': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
  }),
});

// 4. PATCH /resetPassword/:token
export const resetPasswordSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Reset token is required in the URL',
    }),
  }),
  body: Joi.object({
    password: Joi.string().min(8).required().messages({
      'any.required': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
    }),
    passwordConfirm: Joi.string()
      .required()
      .valid(Joi.ref('password'))
      .messages({
        'any.required': 'Password confirmation is required',
        'any.only': 'Passwords do not match',
      }),
  }),
});

// ------------------------------------------
// 🔒 PROTECTED ROUTE SCHEMAS (After protect middleware)
// ------------------------------------------

// 5. PATCH /updateMyPassword
export const updatePasswordSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required',
    }),
    password: Joi.string().min(8).required().messages({
      'any.required': 'New password is required',
      'string.min': 'New password must be at least 8 characters',
    }),
    passwordConfirm: Joi.string()
      .required()
      .valid(Joi.ref('password'))
      .messages({
        'any.required': 'New password confirmation is required',
        'any.only': 'New passwords do not match',
      }),
  }),
});

// 6. PATCH /updateMe
export const updateMeSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    firstName: Joi.string().trim().optional(),
    lastName: Joi.string().trim().optional(),
    email: Joi.string().email().optional().messages({
      'string.email': 'Please provide a valid email address',
    }),
  }).unknown(false), // Rejects unauthorized modifications like "role"
});

// ------------------------------------------
// 👑 ADMIN-ONLY ROUTE SCHEMAS
// ------------------------------------------

// 1. GET / (Admin get all users)
export const getAllUsersSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object(),
  query: Joi.object(), // Allows APIFeatures sorting/filtering parameters through
});

// 2. PATCH /:id (Admin update user)
export const adminUpdateUserSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(), // 🌟 Leaving this open allows any custom ID string structure!
  body: Joi.object({
    firstName: Joi.string().trim().optional(),
    lastName: Joi.string().trim().optional(),
    email: Joi.string().email().optional().messages({
      'string.email': 'Please provide a valid email address',
    }),
    role: Joi.string().valid('user', 'admin', 'uploader').optional().messages({
      'any.only': 'Role must be either user or admin or uploader',
    }),
  }).unknown(false), // Blocks password modifications or malicious fields
});
