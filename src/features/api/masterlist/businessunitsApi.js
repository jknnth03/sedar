import { sedarApi } from "..";

const businessunitsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["businessunits", "showbusinessunits"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postBusinessUnit: build.mutation({
        query: (body) => ({
          url: "business-units/sync",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["businessunits"],
      }),

      getShowBusinessunits: build.query({
        query: (params) => ({
          url: `business-units?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["showbusinessunits"],
      }),

      getAllShowBusinessunits: build.query({
        query: () => ({
          url: `business-units?pagination=none&status=active`,
        }),
        providesTags: ["showbusinessunits"],
      }),
    }),
  });

export const {
  usePostBusinessUnitMutation,
  useGetShowBusinessunitsQuery,
  useGetAllShowBusinessunitsQuery,
} = businessunitsApi;
