const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map((d) => ({ field: d.path[0], message: d.message })),
      code: 'VALIDATION_ERROR',
    });
  }
  next();
};

module.exports = { validate };
