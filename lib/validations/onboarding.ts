import { z } from 'zod';

export const profileSchema = z.object({
  name_ar: z.string().trim().min(2).max(120),
  name_en: z.string().trim().max(120).optional().or(z.literal('')),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
});

export const academicYearSchema = z.object({
  name: z.string().trim().regex(/^\d{4}-\d{4}$/, 'الصيغة المتوقعة: 2025-2026'),
  start_date: z.string().date(),
  end_date: z.string().date(),
});

export const gradesSchema = z.object({
  primary: z.array(z.string().trim().min(1)).max(6).default([]),
  preparatory: z.array(z.string().trim().min(1)).max(3).default([]),
  secondary: z.array(z.string().trim().min(1)).max(3).default([]),
});

export const firstGroupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  grade_name: z.string().trim().min(2),
  subject_name: z.string().trim().min(2),
  pricing: z.enum(['per_session', 'monthly']),
  price: z.coerce.number().nonnegative(),
});

export const subdomainSchema = z.object({
  subdomain: z.string()
    .trim()
    .toLowerCase()
    .min(3, 'الـ Subdomain يجب أن يكون 3 أحرف على الأقل.')
    .max(40)
    .regex(/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/, 'حروف لاتينية صغيرة وأرقام و - فقط.'),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type AcademicYearInput = z.infer<typeof academicYearSchema>;
export type GradesInput = z.infer<typeof gradesSchema>;
export type FirstGroupInput = z.infer<typeof firstGroupSchema>;
export type SubdomainInput = z.infer<typeof subdomainSchema>;
