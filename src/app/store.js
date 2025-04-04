// import { configureStore } from "@reduxjs/toolkit";
// import { sedarApi } from "../features/api";
// import { ymirApi } from "../features/api/masterlist/ymirApi"; // Import ymirApi
// import authSlice from "../features/slice/authSlice";
// import modalSlice from "../features/slice/modalSlice";

// export const store = configureStore({
//   reducer: {
//     auth: authSlice,
//     modal: modalSlice,

//     [sedarApi.reducerPath]: sedarApi.reducer,
//     [ymirApi.reducerPath]: ymirApi.reducer, // Add ymirApi reducer
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(sedarApi.middleware, ymirApi.middleware), // Add ymirApi middleware
// });

import { configureStore } from "@reduxjs/toolkit";
import { sedarApi } from "../features/api";
import { ymirApi } from "../features/api/masterlist/ymirApi";
import rolesApi from "../features/api/usermanagement/rolesApi"; // ✅ Import rolesApi
import authSlice from "../features/slice/authSlice";
import modalSlice from "../features/slice/modalSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    modal: modalSlice,

    [sedarApi.reducerPath]: sedarApi.reducer,
    [ymirApi.reducerPath]: ymirApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer, // ✅ Add rolesApi reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      sedarApi.middleware,
      ymirApi.middleware,
      rolesApi.middleware
    ),
});
