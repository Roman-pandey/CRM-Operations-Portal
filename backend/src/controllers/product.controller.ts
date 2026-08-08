import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';
import { ApiResponse } from '../utils/ApiResponse';

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const data = await productService.getAllProducts(page, limit, search, category);
    res.json(new ApiResponse(true, 'Products retrieved successfully', data));
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await productService.getProductById(parseInt(req.params.id as string));
    res.json(new ApiResponse(true, 'Product retrieved successfully', data));
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await productService.createProduct(req.body);
    res.status(201).json(new ApiResponse(true, 'Product created successfully', data));
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await productService.updateProduct(parseInt(req.params.id as string), req.body);
    res.json(new ApiResponse(true, 'Product updated successfully', data));
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productService.deleteProduct(parseInt(req.params.id as string));
    res.json(new ApiResponse(true, 'Product deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const getLowStockProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await productService.getLowStockProducts();
    res.json(new ApiResponse(true, 'Low stock products retrieved successfully', data));
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quantity, movementType, reason } = req.body;
    const data = await productService.adjustStock(parseInt(req.params.id as string), quantity, movementType, reason, req.user!.id);
    res.json(new ApiResponse(true, 'Stock adjusted successfully', data));
  } catch (error) {
    next(error);
  }
};

export const getStockMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const productId = req.params.id ? parseInt(req.params.id as string) : undefined;
    const data = await productService.getStockMovements(page, limit, productId);
    res.json(new ApiResponse(true, 'Stock movements retrieved successfully', data));
  } catch (error) {
    next(error);
  }
};
