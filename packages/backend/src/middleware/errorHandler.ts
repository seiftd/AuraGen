import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { ApiResponse, HttpStatus, ERROR_CODES } from '@auragen/shared';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  let message = error.message || 'Internal Server Error';
  let code = error.code || ERROR_CODES.SERVER_ERROR;

  // Log error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';
  }

  if (error.name === 'CastError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  }

  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    statusCode = HttpStatus.CONFLICT;
    message = 'Duplicate field value';
    code = 'DUPLICATE_FIELD';
  }

  if (error.name === 'JsonWebTokenError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = 'Invalid token';
    code = ERROR_CODES.TOKEN_EXPIRED;
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = 'Token expired';
    code = ERROR_CODES.TOKEN_EXPIRED;
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
    message = 'Something went wrong';
  }

  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
      path: req.path
    }
  };

  res.status(statusCode).json(response);
};