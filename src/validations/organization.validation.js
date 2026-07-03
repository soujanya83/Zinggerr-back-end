import Joi from 'joi';

export const createOrganizationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Organization name is required',
    'string.empty': 'Organization name is required',
  }),
  streetAddress: Joi.string().trim().required().messages({
    'any.required': 'Street address is required',
    'string.empty': 'Street address is required',
  }),
  city: Joi.string().trim().required().messages({
    'any.required': 'City is required',
    'string.empty': 'City is required',
  }),
  state: Joi.string().trim().required().messages({
    'any.required': 'State is required',
    'string.empty': 'State is required',
  }),
  postalCode: Joi.string().trim().required().messages({
    'any.required': 'Postal code is required',
    'string.empty': 'Postal code is required',
  }),
  logo: Joi.string().trim().optional(),
});

export const updateOrganizationSchema = Joi.object({
  name: Joi.string().trim().optional(),
  streetAddress: Joi.string().trim().optional(),
  city: Joi.string().trim().optional(),
  state: Joi.string().trim().optional(),
  postalCode: Joi.string().trim().optional(),
  logo: Joi.string().trim().optional(),
});
