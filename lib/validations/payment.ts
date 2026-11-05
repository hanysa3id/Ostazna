import { z } from 'zod';

export const paymentSchema = z.object({
  student_id: z.string().uuid(),
  amount: z.coerce.number().positive(),
  payment_date: z.string().date(),
  method: z.enum(['cash', 'bank_transfer', 'wallet', 'other']),
  period_from: z.string().date().optional().or(z.literal('')),
  period_to: z.string().date().optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
