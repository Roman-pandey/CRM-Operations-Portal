import { z } from 'zod';

export const createCustomerSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  mobile: z.string().min(1, 'Mobile number is required'),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  businessName: z.string().optional().nullable().or(z.literal('')),
  gstNumber: z.string().optional().nullable().or(z.literal('')),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']).default('RETAIL'),
  address: z.string().optional().nullable().or(z.literal('')),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).default('LEAD'),
  followUpDate: z.string().optional().nullable().or(z.literal('')),
  notes: z.string().optional().nullable().or(z.literal('')),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createFollowupSchema = z.object({
  followUpDate: z.string().min(1, 'Follow-up date is required'),
  notes: z.string().min(1, 'Notes are required'),
});
