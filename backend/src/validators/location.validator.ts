import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string().min(1),
  level: z.enum(['campus', 'building', 'floor', 'room', 'shelf']),
  parentId: z.number().int().positive().nullable().optional()
});

export const updateLocationSchema = createLocationSchema.partial();
