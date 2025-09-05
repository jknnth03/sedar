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
        query: (params = {}) => {
          const queryParams = new URLSearchParams();
          const page = params.page || 1;
          const per_page = params.per_page || 100;
          const status = params.status || "active";
          queryParams.append("page", page);
          queryParams.append("per_page", per_page);
          queryParams.append("status", status);
          return {
            url: `requisition-types?${queryParams.toString()}`,
          };
        },
        providesTags: ["requisition-types"],
      }),
      getAllRequisitions: build.query({
        query: (params = {}) => {
          const queryParams = new URLSearchParams();
          queryParams.append("pagination", "none");
          queryParams.append("status", params.status || "active");
          return {
            url: `requisition-types?${queryParams.toString()}`,
          };
        },
        providesTags: ["requisition-types"],
        transformResponse: (response) => {
          if (response?.result) {
            return response.result;
          }
          if (response?.data) {
            return response.data;
          }
          if (Array.isArray(response)) {
            return response;
          }
          return [];
        },
      }),
      getRequisitionById: build.query({
        query: (id) => ({
          url: `requisition-types/${id}`,
        }),
        providesTags: (result, error, id) => [
          { type: "requisition-types", id },
        ],
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
      getActiveRequisitionTypes: build.query({
        query: () => ({
          url: "requisition-types?pagination=none&status=active",
        }),
        providesTags: ["requisition-types"],
        transformResponse: (response) => {
          if (response?.result) {
            return response.result;
          }
          if (response?.data) {
            return response.data;
          }
          if (Array.isArray(response)) {
            return response;
          }
          return [];
        },
      }),
    }),
  });

export const {
  usePostRequisitionsMutation,
  useGetShowRequisitionsQuery,
  useGetAllRequisitionsQuery,
  useLazyGetAllRequisitionsQuery,
  useGetRequisitionByIdQuery,
  useUpdateRequisitionsMutation,
  useDeleteRequisitionsMutation,
  useGetActiveRequisitionTypesQuery,
} = requisitionsApi;

export default requisitionsApi;
