import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ConnectivityState {
  isOnline: boolean;
}

const initialState: ConnectivityState = {
  isOnline: true,
};

const connectivitySlice = createSlice({
  name: 'connectivity',
  initialState,
  reducers: {
    setOnline: (state) => {
      state.isOnline = true;
    },
    setOffline: (state) => {
      state.isOnline = false;
    },
    setConnectivity: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
  },
});

export const { setOnline, setOffline, setConnectivity } = connectivitySlice.actions;
export default connectivitySlice.reducer;
