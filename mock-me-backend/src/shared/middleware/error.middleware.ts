import { NextFunction, Request, Response } from 'express';
import { env } from '../config/environment';

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
    stack?: string;
  };
}

// **NEW**: Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handler middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error occurred:', error);

  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let details: any = undefined;

  // Handle custom user errors (temporarily disabled until users feature is created)
  if (error.statusCode && error.code) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
    
    // Include validation details if it's a validation error
    if (error.name === 'ValidationError' && 'errors' in error) {
      details = error.errors;
    }
  }

  // Handle Prisma errors
  else if (error.code && error.code.startsWith('P')) {
    statusCode = 400;
    message = 'Database operation failed';
    code = 'DATABASE_ERROR';
    
    // Handle specific Prisma errors
    switch (error.code) {
      case 'P2002':
        message = 'A record with this information already exists';
        code = 'DUPLICATE_RECORD';
        statusCode = 409;
        break;
      case 'P2025':
        message = 'Record not found';
        code = 'RECORD_NOT_FOUND';
        statusCode = 404;
        break;
    }
  }

  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Handle syntax errors
  else if (error instanceof SyntaxError && 'body' in error) {
    statusCode = 400;
    message = 'Invalid JSON format';
    code = 'INVALID_JSON';
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      code,
      ...(details && { details }),
      ...(env.NODE_ENV === 'development' && { stack: error.stack })
    }
  };

  res.status(statusCode).json(errorResponse);
};

// 404 handler middleware
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND'
    }
  });
};
