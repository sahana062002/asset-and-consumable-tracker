import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

// Global error handler
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error Handled]:', err);

  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors = undefined;

  if (err instanceof ZodError) {
    statusCode = 422;
    message = 'Validation failed';
    errors = err.errors;
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry conflict';
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message || message;
  } else if (err.message) {
    // Reveal helpful standard error messages rather than complete obscuration during dev
    message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {})
  });
};
