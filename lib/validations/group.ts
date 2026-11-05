import { z } from 'zod';

export const groupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  academic_year_id: z.string().uuid(),
  grade_id: z.string().uuid().optional().or(z.literal('')),
  subject_id: z.string().uuid().optional().or(z.literal('')),
  max_students: z.coerce.number().int().min(1).max(500).optional(),
  pricing: z.enum(['per_session', 'monthly']),
  price_per_session: z.coerce.number().nonnegative().optional(),
  price_monthly: z.coerce.number().nonnegative().optional(),
  schedule: z.unknown().optional(),
});

export type GroupInput = z.infer<typeof groupSchema>;
