import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userModal: false,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setUserModal: (state, action) => {
      console.log("Redux setUserModal triggered:", action.payload); // 🔥 ADD THIS
      state.userModal = action.payload;
    },
    resetModal: () => {
      return initialState;
    },
  },
});

export const { setUserModal, resetModal } = modalSlice.actions;

export default modalSlice.reducer;
