import { requiredStringSchema } from '@/schemas/zod.schemas';
import { z } from 'zod';

export const bookingSchema = z.object({
  date: requiredStringSchema(),
  time: requiredStringSchema(false),
  slotId: requiredStringSchema(false),
  reason: requiredStringSchema(),
  appointmentType: requiredStringSchema(),
  additionalInfo: requiredStringSchema(false),
});
