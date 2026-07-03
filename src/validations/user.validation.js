import Joi from 'joi';

export const assignUserPermissionsSchema = Joi.object({
  permissions: Joi.array().items(Joi.string()).required().messages({
    'any.required': 'Permissions array is required',
    'array.base': 'Permissions must be an array',
  }),
});
