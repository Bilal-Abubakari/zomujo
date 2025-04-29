import { ISymptom, ISymptomMap, SymptomsType } from '@/types/consultation.interface';

const urls: Record<SymptomsType, string> = {
  [SymptomsType.Neurological]: '/json/neurologicalSymptoms.json',
  [SymptomsType.Cardiovascular]: '/json/cardiovascularSymptoms.json',
  [SymptomsType.Gastrointestinal]: '/json/gastrointestinalSymptoms.json',
  [SymptomsType.Musculoskeletal]: '/json/musculoskeletalSymptoms.json',
  [SymptomsType.Genitourinary]: '/json/genitourinarySymptoms.json',
  [SymptomsType.Integumentary]: '/json/integumentarySymptoms.json',
  [SymptomsType.Endocrine]: '/json/endocrineSymptoms.json',
};

export const fetchSystemSymptoms = async (): Promise<ISymptomMap> => {
  try {
    // Initialize with empty arrays for all symptom types
    const result = Object.values(SymptomsType).reduce(
      (acc, type) => {
        acc[type] = [];
        return acc;
      },
      {} as Record<SymptomsType, ISymptom[]>,
    ) as ISymptomMap;

    // Fetch data for each type that has a URL defined
    for (const [type, url] of Object.entries(urls)) {
      const response = await fetch(url);
      result[type as SymptomsType] = (await response.json()) as ISymptom[];
    }

    return result;
  } catch (error) {
    console.error(`Fetching system symptoms failed:`, error);
    throw error;
  }
};
