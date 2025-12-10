const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required()
    .messages({
      'string.empty': 'Category name is required',
      'string.min': 'Category name must be at least 2 characters',
      'string.max': 'Category name must not exceed 100 characters',
    }),
  description: Joi.string().trim().max(500).allow('', null)
    .messages({
      'string.max': 'Description must not exceed 500 characters',
    }),
  parentId: Joi.string().hex().length(24).allow(null, '')
    .messages({
      'string.hex': 'Invalid parent category ID format',
      'string.length': 'Invalid parent category ID length',
    }),
  imageUrl: Joi.string().uri().allow('', null)
    .messages({
      'string.uri': 'Image URL must be a valid URL',
    }),
  priority: Joi.number().integer().min(0).default(0)
    .messages({
      'number.base': 'Priority must be a number',
      'number.min': 'Priority must be 0 or greater',
    }),
  status: Joi.string().valid('active', 'inactive').default('active')
    .messages({
      'any.only': 'Status must be either active or inactive',
    }),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100)
    .messages({
      'string.min': 'Category name must be at least 2 characters',
      'string.max': 'Category name must not exceed 100 characters',
    }),
  description: Joi.string().trim().max(500).allow('', null)
    .messages({
      'string.max': 'Description must not exceed 500 characters',
    }),
  parentId: Joi.string().hex().length(24).allow(null, '')
    .messages({
      'string.hex': 'Invalid parent category ID format',
      'string.length': 'Invalid parent category ID length',
    }),
  imageUrl: Joi.string().uri().allow('', null)
    .messages({
      'string.uri': 'Image URL must be a valid URL',
    }),
  priority: Joi.number().integer().min(0)
    .messages({
      'number.base': 'Priority must be a number',
      'number.min': 'Priority must be 0 or greater',
    }),
  status: Joi.string().valid('active', 'inactive')
    .messages({
      'any.only': 'Status must be either active or inactive',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const validateCreateCategory = (data) => {
  const { error, value } = createCategorySchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    const errors = error.details.map(detail => detail.message);
    throw new Error(errors.join(', '));
  }
  return value;
};

const validateUpdateCategory = (data) => {
  const { error, value } = updateCategorySchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    const errors = error.details.map(detail => detail.message);
    throw new Error(errors.join(', '));
  }
  return value;
};

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
};

