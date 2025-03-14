import { configureStore } from "@reduxjs/toolkit";
import { sedarApi } from "../features/api";
import { ymirApi } from "../features/api/ymirApi"; // Import ymirApi

export const store = configureStore({
  reducer: {
    [sedarApi.reducerPath]: sedarApi.reducer,
    [ymirApi.reducerPath]: ymirApi.reducer, // Add ymirApi reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sedarApi.middleware, ymirApi.middleware), // Add ymirApi middleware
});
