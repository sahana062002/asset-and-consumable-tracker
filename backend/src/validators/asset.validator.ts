import { z } from 'zod';

export const listAssetsSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  type: z.enum(['fixed', 'consumable']).optional(),
  status: z.enum(['active', 'disposed']).optional(),
  search: z.string().optional(),
  location_id: z.string().transform(v => (v ? Number(v) : undefined)).optional()
});

export const createAssetSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['fixed', 'consumable']),
  location_id: z.number().int().positive(),
  quantity: z.number().int().nonnegative().optional()
}).superRefine((data, ctx) => {
  if (data.type === 'consumable' && data.quantity === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Quantity is required for consumable assets',
      path: ['quantity']
    });
  }
});

export const updateLocationSchema = z.object({
  location_id: z.number().int().positive(),
  notes: z.string().optional()
});

export const updateUsageSchema = z.object({
  quantity_used: z.number().int().positive(),
  notes: z.string().optional()
});
