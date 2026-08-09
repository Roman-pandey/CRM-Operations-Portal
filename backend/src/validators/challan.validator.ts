import { z } from 'zod';

export const createChallanSchema = z.object({
  customerId: z.coerce.number().int().positive('Valid Customer ID is required'),
  items: z.array(z.object({
    productId: z.coerce.number().int().positive('Valid Product ID is required'),
    quantity: z.coerce.number().positive('Quantity must be > 0')
  })).min(1, 'At least one item is required')
});

export const updateChallanSchema = createChallanSchema.partial();
