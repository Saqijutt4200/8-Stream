// Create a new slice called posterUrl.ts
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentPosterUrl: "",
};

const posterUrlSlice = createSlice({
  name: "posterUrl",
  initialState,
  reducers: {
    setPosterUrl: (state, action) => {
      state.currentPosterUrl = action.payload;
    },
  },
});

export const { setPosterUrl } = posterUrlSlice.actions;
export default posterUrlSlice.reducer;

