import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generateVoiceSummary } from './aiThunk';
import { IVoiceSummaryResponse } from '@/types/ai.interface';

interface AIState {
  voiceSummary: IVoiceSummaryResponse | null;
  isGenerating: boolean;
}

const initialState: AIState = {
  voiceSummary: null,
  isGenerating: false,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setVoiceSummary: (state, action: PayloadAction<IVoiceSummaryResponse | null>) => {
      state.voiceSummary = action.payload;
    },
    resetVoiceSummary: (state) => {
      state.voiceSummary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateVoiceSummary.pending, (state) => {
        state.isGenerating = true;
      })
      .addCase(generateVoiceSummary.fulfilled, (state, action) => {
        state.isGenerating = false;
        if ((action.payload as IVoiceSummaryResponse).summary) {
          state.voiceSummary = action.payload as IVoiceSummaryResponse;
        }
      })
      .addCase(generateVoiceSummary.rejected, (state) => {
        state.isGenerating = false;
      });
  },
});

export const { setVoiceSummary, resetVoiceSummary } = aiSlice.actions;
export default aiSlice.reducer;
