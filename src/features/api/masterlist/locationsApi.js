import { sedarApi } from "..";

const locationsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["locations", "showLocations"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postLocations: build.mutation({
        query: (body) => ({
          url: "locations/sync",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["locations"],
      }),

      getShowLocations: build.query({
        query: (params) => ({
          url: `locations?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["showLocations"],
      }),

      getAllShowLocations: build.query({
        query: () => ({
          url: "locations?pagination=none&status=active",
        }),
        providesTags: ["showLocations"],
      }),
    }),
  });

export const {
  usePostLocationsMutation,
  useGetShowLocationsQuery,
  useGetAllShowLocationsQuery,
} = locationsApi;
