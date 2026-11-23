export class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }

  static badRequest(code, message) {
    return new ApiError(400, code || 'VALIDATION_ERROR', message);
  }

  static unauthorized(message = 'Authentication required.') {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static notFound(message = 'Resource not found or access denied.') {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static payloadTooLarge(message = 'The uploaded file exceeds the 20 MB limit.') {
    return new ApiError(413, 'FILE_TOO_LARGE', message);
  }

  static rateLimited(message = 'AI rate limit encountered. Please retry shortly.') {
    return new ApiError(429, 'AI_RATE_LIMITED', message);
  }

  static internal(message = 'Internal server error.') {
    return new ApiError(500, 'INTERNAL_SERVER_ERROR', message);
  }
}
