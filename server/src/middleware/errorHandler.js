import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred.';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 413;
      code = 'FILE_TOO_LARGE';
      message = 'The uploaded file exceeds the 20 MB limit.';
    } else {
      statusCode = 400;
      code = 'INVALID_FILE';
      message = err.message;
    }
  } else if (err.name === 'CastError' || err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.message;
  } else {
    logger.error('Unhandled server error', err);
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  });
}
