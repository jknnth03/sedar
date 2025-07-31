import { sedarApi } from "..";

const subunitsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["sub_units", "showSub_units"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postSubunits: build.mutation({
        query: (body) => ({
          url: "sub-units/sync",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["sub_units"],
      }),

      getShowSubunits: build.query({
        query: (params) => ({
          url: `sub-units?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["showSub_units"],
      }),

      getAllShowSubunits: build.query({
        query: () => ({
          url: "sub-units?pagination=none&status=active",
        }),
        providesTags: ["showSub_units"],
      }),
    }),
  });

export const {
  usePostSubunitsMutation,
  useGetShowSubunitsQuery,
  useGetAllShowSubunitsQuery,
} = subunitsApi;
