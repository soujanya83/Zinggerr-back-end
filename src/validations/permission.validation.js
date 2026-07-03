import Joi from 'joi';

const objectIdPattern = Joi.string().hex().length(24).messages({
  'string.hex': 'Invalid ID format',
  'string.length': 'ID must be 24 characters long',
});

export const createPermissionSchema = Joi.object({
  module: Joi.string().trim().required().messages({
    'any.required': 'Module is required',
    'string.empty': 'Module is required',
  }),
  permissions: Joi.array().items(Joi.string().trim()).min(1).required().messages({
    'any.required': 'Permissions array is required',
    'array.min': 'At least one permission is required',
  }),
  organization: objectIdPattern.optional(),
});

export const updatePermissionSchema = Joi.object({
  module: Joi.string().trim().optional(),
  permissions: Joi.array().items(Joi.string().trim()).min(1).optional(),
  organization: objectIdPattern.optional(),
});
