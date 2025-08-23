import { Request, Response } from 'express';
import { ApiResponse, HttpStatus } from '@auragen/shared';

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      timestamp: new Date().toISOString(),
      path: req.path
    }
  };

  res.status(HttpStatus.NOT_FOUND).json(response);
};