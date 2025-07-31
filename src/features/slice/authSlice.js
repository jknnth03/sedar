import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    resetAuth: () => {
      return initialState;
    },
  },
});

export const { setToken, resetAuth } = authSlice.actions;

export default authSlice.reducer;
