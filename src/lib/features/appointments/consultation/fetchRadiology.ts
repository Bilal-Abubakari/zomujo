import { RadiologyTest } from '@/types/radiology.interface';

export const fetchRadiology = async (): Promise<RadiologyTest> => {
  try {
    const response = await fetch('/json/radiology.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return (await response.json()) as RadiologyTest;
  } catch (error) {
    console.error('Error fetching radiology tests:', error);
    throw error;
  }
};
