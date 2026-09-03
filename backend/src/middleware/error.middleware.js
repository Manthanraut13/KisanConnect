const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  if (err.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    message = `${err.errors[0].path} already exists`;
  } else if (err.name === 'SequelizeValidationError') {
    status = 400;
    message = err.errors.map((e) => e.message).join(', ');
  } else if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Payload too large';
  }

  if (process.env.NODE_ENV !== 'production') {
    errors = err.stack;
  }

  logger.error({
    message,
    status,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  res.status(status).json({ success: false, message, code: err.code || 'INTERNAL_ERROR', errors });
};

module.exports = errorHandler;
