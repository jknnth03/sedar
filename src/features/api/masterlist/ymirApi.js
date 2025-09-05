import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ymirApi = createApi({
  reducerPath: "ymirApi",
  tagTypes: [
    "ymir",
    "businessunits",
    "companies",
    "departments",
    "units",
    "subunits",
    "locations",
  ],

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_YMIR_URL,
    prepareHeaders: (headers) => {
      const token = import.meta.env.VITE_YMIR_KEY;
      headers.set("Token", `Bearer ${token}`);
      headers.set("Accept", "application/json");
      return headers;
    },
  }),

  endpoints: (builder) => ({
    getBusinessunits: builder.query({
      query: () => ({
        url: "business-units?pagination=none&status=active&search=&Vladimir=sync",
      }),
      providesTags: ["businessunits"],
    }),

    getCompanies: builder.query({
      query: () => ({
        url: "companies?pagination=none&status=active&search=&Vladimir=sync",
      }),
      providesTags: ["companies"],
    }),

    getDepartments: builder.query({
      query: () => ({
        url: "departments?pagination=none&status=active&search=&Vladimir=sync",
      }),
      providesTags: ["departments"],
    }),

    getUnits: builder.query({
      query: () => ({
        url: "units_department?pagination=none&status=active&search=&Vladimir=sync",
      }),
      providesTags: ["units"],
    }),

    getSubunits: builder.query({
      query: () => ({
        url: "sub_units?pagination=none&status=active&search=&Vladimir=sync",
      }),
      providesTags: ["subunits"],
    }),

    getLocations: builder.query({
      query: () => ({
        url: "locations?pagination=none&status=active&search=&Vladimir=sync",
      }),
      providesTags: ["locations"],
    }),
  }),
});

export const {
  useGetBusinessunitsQuery,
  useLazyGetBusinessunitsQuery,
  useGetCompaniesQuery,
  useLazyGetCompaniesQuery,
  useGetDepartmentsQuery,
  useLazyGetDepartmentsQuery,
  useGetUnitsQuery,
  useLazyGetUnitsQuery,
  useGetSubunitsQuery,
  useLazyGetSubunitsQuery,
  useGetLocationsQuery,
  useLazyGetLocationsQuery,
} = ymirApi;
