import { z } from 'zod';
import {
  ChemicalPathologyCategory,
  HaematologyCategory,
  ImmunologyCategory,
  LabTestSection,
  MicrobiologyCategory,
} from '@/types/labs.enum';

export const labsSchema = z.object({
  labs: z
    .array(
      z.object({
        testName: z.string(),
        category: z.enum(LabTestSection),
        categoryType: z.union([
          z.enum(ChemicalPathologyCategory),
          z.enum(HaematologyCategory),
          z.enum(ImmunologyCategory),
          z.enum(MicrobiologyCategory),
        ]),
      }),
    )
    .min(1),
  instructions: z.string().optional(),
  history: z.string().optional(),
});

export type LabsForm = z.infer<typeof labsSchema>;
