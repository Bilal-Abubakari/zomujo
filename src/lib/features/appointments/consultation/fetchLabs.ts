import { LaboratoryTest } from '@/types/labs.interface';

export const fetchLabs = async (): Promise<LaboratoryTest> => {
  try {
    const response = await fetch('/json/labs.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return (await response.json()) as LaboratoryTest;
  } catch (error) {
    console.error('Error fetching lab tests:', error);
    throw error;
  }
};
