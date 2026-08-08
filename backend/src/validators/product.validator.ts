import { z } from 'zod';

export const createProductSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().optional(),
  unitPrice: z.number().min(0, 'Unit price must be >= 0'),
  currentStock: z.number().min(0, 'Current stock must be >= 0'),
  minimumStock: z.number().min(0, 'Minimum stock must be >= 0'),
  warehouseLocation: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const stockAdjustmentSchema = z.object({
  quantity: z.number().positive('Quantity must be > 0'),
  movementType: z.enum(['IN', 'OUT']),
  reason: z.string().min(1, 'Reason is required'),
});
