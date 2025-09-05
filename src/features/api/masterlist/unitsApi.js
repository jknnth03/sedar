import { sedarApi } from "..";

const unitsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["units", "showUnits"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postUnits: build.mutation({
        query: (body) => ({
          url: "units/sync",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["units"],
      }),

      getShowUnits: build.query({
        query: (params) => ({
          url: `units?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["showUnits"],
      }),

      getAllShowUnits: build.query({
        query: () => ({
          url: "units?pagination=none&status=active",
        }),
        providesTags: ["showUnits"],
      }),
    }),
  });

export const {
  usePostUnitsMutation,
  useGetShowUnitsQuery,
  useGetAllShowUnitsQuery,
} = unitsApi;
