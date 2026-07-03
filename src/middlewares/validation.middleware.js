export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorDetails = {};
    error.details.forEach((detail) => {
      // Use the field name as key and the error message as value
      errorDetails[detail.path[0]] = detail.message.replace(/['"]/g, '');
    });
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errorDetails
    });
  }
  next();
};
