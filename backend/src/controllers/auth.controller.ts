import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.json(new ApiResponse(true, 'Login successful', data));
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.getCurrentUser(req.user!.id);
    res.json(new ApiResponse(true, 'User details retrieved', data));
  } catch (error) {
    next(error);
  }
};
