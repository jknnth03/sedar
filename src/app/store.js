import { configureStore } from "@reduxjs/toolkit";
import { sedarApi } from "../features/api";
import { ymirApi } from "../features/api/masterlist/ymirApi";
import authSlice from "../features/slice/authSlice";
import modalSlice from "../features/slice/modalSlice";
import { onerdfApi } from "../features/api/masterlist/onerdfApi";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    modal: modalSlice,

    [sedarApi.reducerPath]: sedarApi.reducer,
    [ymirApi.reducerPath]: ymirApi.reducer,
    [onerdfApi.reducerPath]: onerdfApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      sedarApi.middleware,
      ymirApi.middleware,
      onerdfApi.middleware
    ),
});
