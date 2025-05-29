import { sedarApi } from "..";

const requisitionsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["requisition-types"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postRequisitions: build.mutation({
        query: (body) => ({
          url: "requisition-types",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["requisition-types"],
      }),

      getShowRequisitions: build.query({
        query: (params = { page: 1, per_page: 100, status: "active" }) => ({
          url: `requisition-types?page=${params.page}&per_page=${params.per_page}&status=${params.status}`,
        }),
        providesTags: ["requisition-types"],
      }),

      updateRequisitions: build.mutation({
        query: ({ id, ...body }) => ({
          url: `requisition-types/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["requisition-types"],
      }),

      deleteRequisitions: build.mutation({
        query: (id) => ({
          url: `requisition-types/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["requisition-types"],
      }),
    }),
  });

export const {
  usePostRequisitionsMutation,
  useGetShowRequisitionsQuery,
  useUpdateRequisitionsMutation,
  useDeleteRequisitionsMutation,
} = requisitionsApi;
