// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// export const onerdfApi = createApi({
//   reducerPath: "onerdfApi",
//   tagTypes: [
//     "regions",
//     "provinces",
//     "cities",
//     "submunicipalities",
//     "barangays",
//   ],

//   baseQuery: fetchBaseQuery({
//     baseUrl: "http://10.10.12.12:8004/api/", // Base URL for all endpoints
//     prepareHeaders: (headers) => {
//       const token = import.meta.env.VITE_YMIR_KEY; // Assuming the token remains the same for authentication
//       headers.set("Token", `Bearer ${token}`);
//       headers.set("Accept", "application/json");
//       return headers;
//     },
//   }),

//   endpoints: (builder) => ({
//     getRegions: builder.query({
//       query: () => ({
//         url: "region?search=&pagination=none&status=active",
//       }),
//       providesTags: ["regions"],
//     }),

//     getProvinces: builder.query({
//       query: () => ({
//         url: "province?search=&pagination=none&status=active",
//       }),
//       providesTags: ["provinces"],
//     }),

//     getCities: builder.query({
//       query: () => ({
//         url: "city-municipality?search=&pagination=none&status=active",
//       }),
//       providesTags: ["cities"],
//     }),

//     getSubmunicipalities: builder.query({
//       query: () => ({
//         url: "sub-municipality?search=&pagination=none&status=active",
//       }),
//       providesTags: ["submunicipalities"],
//     }),

//     getBarangays: builder.query({
//       query: () => ({
//         url: "barangay?search=&pagination=none&status=active",
//       }),
//       providesTags: ["barangays"],
//     }),
//   }),
// });
// export const {
//   useGetRegionsQuery,
//   useLazyGetRegionsQuery,
//   useGetProvincesQuery,
//   useLazyGetProvincesQuery,
//   useGetCitiesQuery,
//   useLazyGetCitiesQuery,
//   useGetSubmunicipalitiesQuery,
//   useLazyGetSubmunicipalitiesQuery,
//   useGetBarangaysQuery,
//   useLazyGetBarangaysQuery,
// } = onerdfApi;
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const onerdfApi = createApi({
  reducerPath: "onerdfApi",
  tagTypes: [
    "regions",
    "provinces",
    "cities",
    "submunicipalities",
    "barangays",
  ],
  baseQuery: fetchBaseQuery({
    baseUrl: "http://10.10.12.12:8004/api/",
    prepareHeaders: (headers) => {
      const token = import.meta.env.VITE_YMIR_KEY;
      headers.set("Token", `Bearer ${token}`);
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  keepUnusedDataFor: 600,
  refetchOnMountOrArgChange: 300,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  endpoints: (builder) => ({
    getRegions: builder.query({
      query: () => ({
        url: "region?search=&pagination=none&status=active",
      }),
      providesTags: ["regions"],
    }),
    getProvinces: builder.query({
      query: () => ({
        url: "province?search=&pagination=none&status=active",
      }),
      providesTags: ["provinces"],
    }),
    getCities: builder.query({
      query: () => ({
        url: "city-municipality?search=&pagination=none&status=active",
      }),
      providesTags: ["cities"],
    }),
    getSubmunicipalities: builder.query({
      query: () => ({
        url: "sub-municipality?search=&pagination=none&status=active",
      }),
      providesTags: ["submunicipalities"],
    }),
    getBarangays: builder.query({
      query: () => ({
        url: "barangay?search=&pagination=none&status=active",
      }),
      providesTags: ["barangays"],
    }),
  }),
});

export const {
  useGetRegionsQuery,
  useLazyGetRegionsQuery,
  useGetProvincesQuery,
  useLazyGetProvincesQuery,
  useGetCitiesQuery,
  useLazyGetCitiesQuery,
  useGetSubmunicipalitiesQuery,
  useLazyGetSubmunicipalitiesQuery,
  useGetBarangaysQuery,
  useLazyGetBarangaysQuery,
} = onerdfApi;
