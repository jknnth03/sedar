import { sedarApi } from ".";

const businessunitsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["businessunits", "showbusinessunits"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // POST to sync business units
      postBusinessUnit: build.mutation({
        query: (body) => ({
          url: "business-units/sync",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["businessunits"],
      }),

      // GET to fetch synced business units from the backend
      getShowBusinessunits: build.query({
        query: (params) => ({
          url: `business-units?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["showbusinessunits"],
      }),
    }),
  });

export const { usePostBusinessUnitMutation, useGetShowBusinessunitsQuery } =
  businessunitsApi;
