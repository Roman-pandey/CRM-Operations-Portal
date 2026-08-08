import { Request, Response, NextFunction } from 'express';
import * as customerService from '../services/customer.service';
import { ApiResponse } from '../utils/ApiResponse';

export const getAllCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const customerType = req.query.customerType as string;
    const data = await customerService.getAllCustomers(page, limit, search, status, customerType);
    res.json(new ApiResponse(true, 'Customers retrieved successfully', data));
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await customerService.getCustomerById(parseInt(req.params.id as string));
    res.json(new ApiResponse(true, 'Customer retrieved successfully', data));
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await customerService.createCustomer(req.body);
    res.status(201).json(new ApiResponse(true, 'Customer created successfully', data));
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await customerService.updateCustomer(parseInt(req.params.id as string), req.body);
    res.json(new ApiResponse(true, 'Customer updated successfully', data));
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await customerService.deleteCustomer(parseInt(req.params.id as string));
    res.json(new ApiResponse(true, 'Customer deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const getFollowups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await customerService.getFollowups(parseInt(req.params.id as string));
    res.json(new ApiResponse(true, 'Followups retrieved successfully', data));
  } catch (error) {
    next(error);
  }
};

export const createFollowup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await customerService.createFollowup(parseInt(req.params.id as string), req.body, req.user!.id);
    res.status(201).json(new ApiResponse(true, 'Followup created successfully', data));
  } catch (error) {
    next(error);
  }
};
