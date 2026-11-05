import { z } from 'zod';

export const studentSchema = z.object({
  name_ar: z.string().trim().min(2).max(120),
  name_en: z.string().trim().max(120).optional().or(z.literal('')),
  date_of_birth: z.string().date().optional().or(z.literal('')),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  parent_name: z.string().trim().max(120).optional().or(z.literal('')),
  parent_phone: z.string().trim().max(20).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export type StudentInput = z.infer<typeof studentSchema>;
