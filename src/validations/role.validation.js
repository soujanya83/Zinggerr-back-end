import Joi from 'joi';

const objectIdPattern = Joi.string().hex().length(24).messages({
  'string.hex': 'Invalid ID format',
  'string.length': 'ID must be 24 characters long',
});

export const createRoleSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Role name is required',
    'string.empty': 'Role name is required',
  }),
  description: Joi.string().trim().optional().allow(''),
  permissions: Joi.array().items(Joi.string()).optional(),
  organization: objectIdPattern.optional(),
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().trim().optional(),
  description: Joi.string().trim().optional().allow(''),
  permissions: Joi.array().items(Joi.string()).optional(),
});

export const assignRolePermissionsSchema = Joi.object({
  permissions: Joi.array().items(Joi.string()).required().messages({
    'any.required': 'Permissions array is required',
    'array.base': 'Permissions must be an array',
  }),
});
