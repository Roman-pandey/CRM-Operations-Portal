import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { ApiResponse } from '../utils/ApiResponse';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await userService.getAllUsers(page, limit);
    res.json(new ApiResponse(true, 'Users retrieved successfully', data));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await userService.getUserById(parseInt(req.params.id as string));
    res.json(new ApiResponse(true, 'User retrieved successfully', data));
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await userService.createUser(req.body);
    res.status(201).json(new ApiResponse(true, 'User created successfully', data));
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await userService.updateUser(parseInt(req.params.id as string), req.body);
    res.json(new ApiResponse(true, 'User updated successfully', data));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.deleteUser(parseInt(req.params.id as string));
    res.json(new ApiResponse(true, 'User deleted successfully'));
  } catch (error) {
    next(error);
  }
};
