import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const token = localStorage.getItem("token");

// export const ymirApi = createApi({
//   reducerPath: "api",
//   baseQuery: fetchBaseQuery({
//     baseUrl: "https://pretestomega.rdfymir.com/backend/public/api/",
//     prepareHeaders: (headers) => {
//       if (token) {
//         headers.set("Authorization", `Bearer ${token}`);
//       }
//       headers.set("Accept", "application/json");
//       return headers;
//     },
//   }),
//   endpoints: () => ({}),
// });

export const sedarApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://10.10.13.9:8001/api/",
    prepareHeaders: (headers) => {
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  endpoints: () => ({}),
});
