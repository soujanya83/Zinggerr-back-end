import Joi from 'joi';

export const signupSchema = Joi.object({
  firstname: Joi.string().trim().required().messages({
    'any.required': 'First name is required',
    'string.empty': 'First name is required'
  }),
  lastname: Joi.string().trim().required().messages({
    'any.required': 'Last name is required',
    'string.empty': 'Last name is required'
  }),
  gender: Joi.string().valid('male', 'female', 'other').default('other'),
  avatar: Joi.string().trim(),
  contactNumber: Joi.string().trim().required().messages({
    'any.required': 'Contact number is required',
    'string.empty': 'Contact number is required'
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    'any.required': 'Email is required',
    'string.empty': 'Email is required',
    'string.email': 'Please fill a valid email address'
  }),
  password: Joi.string().min(6).required().messages({
    'any.required': 'Password is required',
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters'
  }),
  userType: Joi.string().valid('individual', 'organization').default('individual').required().messages({
    'any.required': 'User type is required',
    'any.only': 'User type must be either individual or organization'
  }),
  rememberMe: Joi.boolean().optional().default(false)
});

export const signinSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'any.required': 'Email is required',
    'string.empty': 'Email is required',
    'string.email': 'Please fill a valid email address'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
    'string.empty': 'Password is required'
  }),
  rememberMe: Joi.boolean().optional().default(false)
});

export const onboardOrganizationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Organization name is required',
    'string.empty': 'Organization name is required'
  }),
  streetAddress: Joi.string().trim().required().messages({
    'any.required': 'Street address is required',
    'string.empty': 'Street address is required'
  }),
  city: Joi.string().trim().required().messages({
    'any.required': 'City is required',
    'string.empty': 'City is required'
  }),
  state: Joi.string().trim().required().messages({
    'any.required': 'State is required',
    'string.empty': 'State is required'
  }),
  postalCode: Joi.string().trim().required().messages({
    'any.required': 'Postal code is required',
    'string.empty': 'Postal code is required'
  })
});
