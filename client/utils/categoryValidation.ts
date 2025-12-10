import Joi from 'joi';

export const createCategorySchema = Joi.object({
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
  parentId: Joi.string().allow(null, '').optional(),
  imageUrl: Joi.string().uri().allow('', null).optional()
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

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional()
    .messages({
      'string.min': 'Category name must be at least 2 characters',
      'string.max': 'Category name must not exceed 100 characters',
    }),
  description: Joi.string().trim().max(500).allow('', null).optional()
    .messages({
      'string.max': 'Description must not exceed 500 characters',
    }),
  parentId: Joi.string().allow(null, '').optional(),
  imageUrl: Joi.string().uri().allow('', null).optional()
    .messages({
      'string.uri': 'Image URL must be a valid URL',
    }),
  priority: Joi.number().integer().min(0).optional()
    .messages({
      'number.base': 'Priority must be a number',
      'number.min': 'Priority must be 0 or greater',
    }),
  status: Joi.string().valid('active', 'inactive').optional()
    .messages({
      'any.only': 'Status must be either active or inactive',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

export const validateCategory = (data: any, isUpdate = false) => {
  const schema = isUpdate ? updateCategorySchema : createCategorySchema;
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
  
  if (error) {
    const errors: Record<string, string> = {};
    error.details.forEach((detail) => {
      const path = detail.path.join('.');
      errors[path] = detail.message;
    });
    return { errors, value: null };
  }
  
  return { errors: null, value };
};

