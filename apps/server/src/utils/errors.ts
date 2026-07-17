export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;

  constructor(message: string, statusCode: number, errorCode: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errorCode = 'BAD_REQUEST') {
    super(message, 400, errorCode);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
    super(message, 401, errorCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', errorCode = 'FORBIDDEN') {
    super(message, 403, errorCode);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource Not Found', errorCode = 'NOT_FOUND') {
    super(message, 404, errorCode);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', errorCode = 'INTERNAL_ERROR') {
    super(message, 500, errorCode);
  }
}
