import { sedarApi } from "..";

const regionsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["regions", "showRegions"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postRegions: build.mutation({
        query: (body) => ({
          url: "regions/sync",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["regions"],
      }),

      getShowRegions: build.query({
        query: (params) => ({
          url: `regions?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["showRegions"],
      }),

      getAllShowRegions: build.query({
        query: () => ({
          url: "regions?pagination=none&status=active",
        }),
        providesTags: ["showRegions"],
      }),

      getRegionById: build.query({
        query: (id) => ({
          url: `regions/${id}`,
        }),
        providesTags: ["showRegions"],
      }),
    }),
  });

export const {
  usePostRegionsMutation,
  useGetShowRegionsQuery,
  useLazyGetShowRegionsQuery,
  useGetAllShowRegionsQuery,
  useLazyGetAllShowRegionsQuery,
  useGetRegionByIdQuery,
  useLazyGetRegionByIdQuery,
} = regionsApi;
