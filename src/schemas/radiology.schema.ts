import { z } from 'zod';
import {
  InterventionalRadiologyCategory,
  PlainRadiologyCategory,
  RadiologySection,
  SpecializedImagingCategory,
  UltrasoundScansCategory,
} from '@/types/radiology.enum';
import { requiredStringSchema } from '@/schemas/zod.schemas';

export const radiologySchema = z.object({
  tests: z
    .array(
      z.object({
        testName: z.string(),
        category: z.enum(RadiologySection),
        categoryType: z.union([
          z.enum(PlainRadiologyCategory),
          z.enum(UltrasoundScansCategory),
          z.enum(SpecializedImagingCategory),
          z.enum(InterventionalRadiologyCategory),
        ]),
      }),
    )
    .min(1),
  procedureRequest: z.string(),
  history: z.string().min(5, 'History/Relevant Symptoms is required (minimum 5 characters)'),
  questions: z
    .array(requiredStringSchema())
    .max(3, 'Maximum 3 questions allowed')
    .min(1, 'At least one question'),
});

export type RadiologyForm = z.infer<typeof radiologySchema>;
