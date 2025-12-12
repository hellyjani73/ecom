import Joi from 'joi';


export const loginValidator = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

export const registerValidator = Joi.object({
  name: Joi.string().required().min(2).max(100).messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 100 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
  }),
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password must not exceed 128 characters',
    }),
  role: Joi.string().valid('admin', 'customer').optional().messages({
    'any.only': 'Role must be one of: admin, customer',
  }),
});
export const googleLoginValidator = Joi.object({
  accessToken: Joi.string().required().messages({
    'string.empty': 'Google access token is required',
  }),
});

export const refreshTokenValidator = Joi.object({
  refreshToken: Joi.string().optional().messages({
    'string.base': 'Refresh token must be a string',
  }),
});
export const changePasswordSchemaValidator = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
  }),
  oldPassword: Joi.string().required().messages({
    'string.empty': 'Old Password is required',
  }),
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/) // Password should contain at least one lowercase, one uppercase, and one special character
    .messages({
      'string.base': 'New Password should be a type of string',
      'string.empty': 'New Password cannot be empty',
      'string.min': 'New Password should have a minimum length of 6 characters',
      'string.max': 'New Password should have a maximum length of 128 characters',
      'string.pattern.base': 'New Password should contain at least one uppercase letter, one lowercase letter, and one special character',
    }),
})