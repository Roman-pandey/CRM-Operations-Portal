import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { ApiResponse } from '../utils/ApiResponse';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getDashboardStats();
    res.json(new ApiResponse(true, 'Dashboard stats retrieved successfully', data));
  } catch (error) {
    next(error);
  }
};
