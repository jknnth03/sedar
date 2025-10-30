import { sedarApi } from "..";

const filterApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["filter"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getAllTeamFilters: build.query({
        query: () => ({
          url: `filters/teams`,
        }),
        providesTags: ["filter"],
      }),
      getAllEmploymentTypeFilters: build.query({
        query: () => ({
          url: `filters/employment-types`,
        }),
        providesTags: ["filter"],
      }),
      getAllPositionFilters: build.query({
        query: () => ({
          url: `filters/positions`,
        }),
        providesTags: ["filter"],
      }),
      getAllDepartmentFilters: build.query({
        query: () => ({
          url: `filters/departments`,
        }),
        providesTags: ["filter"],
      }),
      getAllMrfFilters: build.query({
        query: () => ({
          url: `filters/mrfs`,
        }),
        providesTags: ["filter"],
      }),
    }),
  });

export const {
  useGetAllTeamFiltersQuery,
  useLazyGetAllTeamFiltersQuery,
  useGetAllEmploymentTypeFiltersQuery,
  useLazyGetAllEmploymentTypeFiltersQuery,
  useGetAllPositionFiltersQuery,
  useLazyGetAllPositionFiltersQuery,
  useGetAllDepartmentFiltersQuery,
  useLazyGetAllDepartmentFiltersQuery,
  useGetAllMrfFiltersQuery,
  useLazyGetAllMrfFiltersQuery,
} = filterApi;
