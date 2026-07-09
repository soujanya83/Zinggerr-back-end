import Joi from 'joi';

const objectIdPattern = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format',
});

export const assignUserPermissionsSchema = Joi.object({
  permissions: Joi.array().items(Joi.string()).required().messages({
    'any.required': 'Permissions array is required',
    'array.base': 'Permissions must be an array',
  }),
});

export const createUserSchema = Joi.object({
  firstname: Joi.string().trim().required().messages({
    'any.required': 'First name is required',
    'string.empty': 'First name cannot be empty',
  }),
  middlename: Joi.string().trim().optional().allow(''),
  lastname: Joi.string().trim().required().messages({
    'any.required': 'Last name is required',
    'string.empty': 'Last name cannot be empty',
  }),
  avatar: Joi.string().trim().optional().allow(''),
  gender: Joi.string().trim().valid('male', 'female', 'other').required().messages({
    'any.required': 'Gender is required',
    'any.only': 'Gender must be male, female, or other',
  }),
  contactNumber: Joi.string().trim().regex(/^\+[1-9]\d{0,4}[2-9]\d{5,12}$/).required().messages({
    'any.required': 'Contact number is required',
    'string.empty': 'Contact number cannot be empty',
    'string.pattern.base': 'Contact number must be a valid phone number with country code (e.g. +614xxxxxxxx)',
  }),
  email: Joi.string().trim().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Invalid email format',
  }),
  password: Joi.string().trim().min(6).required().messages({
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
  }),
  role: objectIdPattern.required().messages({
    'any.required': 'Role is required',
  }),
  status: Joi.string().trim().valid('active', 'inactive').optional().default('active'),
  organization: objectIdPattern.required().messages({
    'any.required': 'Organization ID is required',
  }),
});

export const updateUserSchema = Joi.object({
  firstname: Joi.string().trim().optional(),
  middlename: Joi.string().trim().optional().allow(''),
  lastname: Joi.string().trim().optional(),
  avatar: Joi.string().trim().optional().allow(''),
  gender: Joi.string().trim().valid('male', 'female', 'other').optional(),
  contactNumber: Joi.string().trim().regex(/^\+[1-9]\d{0,4}[2-9]\d{5,12}$/).optional().messages({
    'string.pattern.base': 'Contact number must be a valid phone number with country code (e.g. +614xxxxxxxx)',
  }),
  email: Joi.string().trim().email().optional(),
  password: Joi.string().trim().min(6).optional(),
  role: objectIdPattern.optional(),
  status: Joi.string().trim().valid('active', 'inactive').optional(),
  organization: objectIdPattern.optional(),
});
