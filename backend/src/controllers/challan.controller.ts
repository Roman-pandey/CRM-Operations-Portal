import { Request, Response, NextFunction } from 'express';
import * as challanService from '../services/challan.service';
import { ApiResponse } from '../utils/ApiResponse';

export const getAllChallans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const data = await challanService.getAllChallans(page, limit, search, status);
    res.json(new ApiResponse(true, 'Challans retrieved successfully', data));
  } catch (error) {
    next(error);
  }
};

export const getChallanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await challanService.getChallanById(parseInt(req.params.id as string));
    res.json(new ApiResponse(true, 'Challan retrieved successfully', data));
  } catch (error) {
    next(error);
  }
};

export const createChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await challanService.createChallan(req.body, req.user!.id);
    res.status(201).json(new ApiResponse(true, 'Challan created successfully', data));
  } catch (error) {
    next(error);
  }
};

export const updateChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await challanService.updateChallan(parseInt(req.params.id as string), req.body);
    res.json(new ApiResponse(true, 'Challan updated successfully', data));
  } catch (error) {
    next(error);
  }
};

export const confirmChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await challanService.confirmChallan(parseInt(req.params.id as string), req.user!.id);
    res.json(new ApiResponse(true, 'Challan confirmed successfully', data));
  } catch (error) {
    next(error);
  }
};

export const cancelChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await challanService.cancelChallan(parseInt(req.params.id as string), req.user!.id);
    res.json(new ApiResponse(true, 'Challan cancelled successfully', data));
  } catch (error) {
    next(error);
  }
};
