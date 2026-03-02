import { requiredStringSchema } from '@/schemas/zod.schemas';
import { z } from 'zod';

export const bookingSchema = z.object({
  date: requiredStringSchema(),
  time: requiredStringSchema(false).optional(),
  slotId: requiredStringSchema(false).optional(),
  reason: requiredStringSchema(),
  appointmentType: requiredStringSchema(),
  additionalInfo: requiredStringSchema(false),
});
