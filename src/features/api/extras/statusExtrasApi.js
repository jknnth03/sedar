import { sedarApi } from "..";

const statusExtrasApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["status"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postStatus: build.mutation({
        query: (body) => ({
          url: "status",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["status"],
      }),

      getShowStatus: build.query({
        query: (params) => ({
          url: `status?pagination=${params.pagination}&page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["status"],
      }),

      getAllShowStatus: build.query({
        query: () => ({
          url: "status?pagination=none&status=active",
        }),
        providesTags: ["status"],
      }),

      updateStatus: build.mutation({
        query: ({ id, ...body }) => ({
          url: `status/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["status"],
      }),

      deleteExtraStatus: build.mutation({
        query: (id) => ({
          url: `status/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["status"],
      }),
    }),
  });

export const {
  usePostStatusMutation,
  useGetShowStatusQuery,
  useLazyGetShowStatusQuery,
  useGetAllShowStatusQuery,
  useLazyGetAllShowStatusQuery,
  useUpdateStatusMutation,
  useDeleteExtraStatusMutation,
} = statusExtrasApi;
