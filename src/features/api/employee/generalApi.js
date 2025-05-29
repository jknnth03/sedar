import { sedarApi } from "..";

const generalApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["general"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postGeneral: build.mutation({
        query: (body) => ({
          url: "employees",
          method: "POST",
          body,
        }),
        invalidatesTags: ["general"],
      }),

      getGenerals: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => ({
          url: `employees/general-info?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
        providesTags: ["general"],
      }),

      getAllGenerals: build.query({
        query: () => ({
          url: `employees?pagination=none&status=active`,
        }),
        providesTags: ["general"],
      }),

      getSingleGeneral: build.query({
        query: (id) => ({
          url: `employees/${id}`,
        }),
        providesTags: ["general"],
      }),

      updateGeneral: build.mutation({
        query: ({ id, ...body }) => ({
          url: `employees/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: ["general"],
      }),

      deleteGeneral: build.mutation({
        query: (id) => ({
          url: `employees/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["general"],
      }),
    }),
  });

export const {
  usePostGeneralMutation,
  useGetGeneralsQuery,
  useGetAllGeneralsQuery,
  useGetSingleGeneralQuery,
  useUpdateGeneralMutation,
  useDeleteGeneralMutation,
  useDeletePositionMutation,
  useGetPositionQuery,
} = generalApi;
