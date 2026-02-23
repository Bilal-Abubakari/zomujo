import { z } from 'zod';
import {
  InterventionalRadiologyCategory,
  PlainRadiologyCategory,
  RadiologySection,
  SpecializedImagingCategory,
  UltrasoundScansCategory,
} from '@/types/radiology.enum';

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
  instructions: z.string().optional(),
});

export type RadiologyForm = z.infer<typeof radiologySchema>;
