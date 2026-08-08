import { z } from 'zod';

export const createCustomerSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  mobile: z.string().min(1, 'Mobile number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']).default('RETAIL'),
  address: z.string().optional(),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).default('LEAD'),
  followUpDate: z.string().optional(),
  notes: z.string().optional()
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createFollowupSchema = z.object({
  followUpDate: z.string().min(1, 'Follow-up date is required'),
  notes: z.string().min(1, 'Notes are required'),
});
