import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode, message } = err;

  if (err.code === 'P2002') {
    statusCode = 400;
    message = 'Duplicate field value entered';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Resource not found';
  }

  if (!(err instanceof ApiError) && !statusCode) {
    statusCode = 500;
    message = err.message || 'Internal Server Error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
};
