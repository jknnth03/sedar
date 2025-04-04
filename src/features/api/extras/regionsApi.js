import { sedarApi } from "..";

const regionsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["regions"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postRegions: build.mutation({
        query: (body) => ({
          url: "regions",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["regions"],
      }),

      getShowRegions: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status,
          search = "",
          pagination = true,
        }) => {
          const queryParams = new URLSearchParams();

          queryParams.append("page", page);
          queryParams.append("per_page", per_page);
          queryParams.append("pagination", pagination);

          if (status) queryParams.append("status", status);
          if (search) queryParams.append("search", search);

          return { url: `regions?${queryParams.toString()}` };
        },
        providesTags: ["regions"],
      }),

      updateRegions: build.mutation({
        query: ({ id, ...body }) => ({
          url: `regions/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["regions"],
      }),

      deleteRegions: build.mutation({
        query: (id) => ({
          url: `regions/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["regions"],
      }),
    }),
  });

export const {
  usePostRegionsMutation,
  useGetShowRegionsQuery,
  useUpdateRegionsMutation,
  useDeleteRegionsMutation,
} = regionsApi;
