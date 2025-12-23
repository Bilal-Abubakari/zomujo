import { RootState } from '@/lib/store';

export const selectAISummary = (state: RootState): string | undefined =>
  state.ai.voiceSummary?.summary;
export const selectAIGenerating = (state: RootState): boolean => state.ai.isGenerating;
