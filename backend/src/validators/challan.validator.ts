import { z } from 'zod';

export const createChallanSchema = z.object({
  customerId: z.number().int().positive('Valid Customer ID is required'),
  items: z.array(z.object({
    productId: z.number().int().positive('Valid Product ID is required'),
    quantity: z.number().positive('Quantity must be > 0')
  })).min(1, 'At least one item is required')
});

export const updateChallanSchema = createChallanSchema.partial();
