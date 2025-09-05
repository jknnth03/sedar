import { sedarApi } from "..";

const approvalFlowApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["approvalFlows"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getApprovalFlows: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status,
            search,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());

          if (status) {
            queryParams.append("status", status);
          }

          if (search && search.trim() !== "") {
            queryParams.append("search", search.trim());
          }

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });

          const queryString = queryParams.toString();
          const url = queryString
            ? `approval-flows?${queryString}`
            : "approval-flows";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["approvalFlows"],
      }),
      getSingleApprovalFlow: build.query({
        query: (approvalFlowId) => ({
          url: `approval-flows/${approvalFlowId}`,
          method: "GET",
        }),
        providesTags: (result, error, approvalFlowId) => [
          { type: "approvalFlows", id: approvalFlowId },
          "approvalFlows",
        ],
      }),
      createApprovalFlow: build.mutation({
        query: (body) => ({
          url: "approval-flows",
          method: "POST",
          body,
        }),
        invalidatesTags: ["approvalFlows"],
      }),
      updateApprovalFlow: build.mutation({
        query: (body) => ({
          url: `approval-flows/${body?.id}`,
          method: "PATCH",
          body: body?.data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "approvalFlows", id },
          "approvalFlows",
        ],
      }),
      deleteApprovalFlow: build.mutation({
        query: (flowId) => ({
          url: `approval-flows/${flowId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, flowId) => [
          { type: "approvalFlows", id: flowId },
          "approvalFlows",
        ],
      }),
    }),
  });

export const {
  useGetApprovalFlowsQuery,
  useGetSingleApprovalFlowQuery,
  useLazyGetSingleApprovalFlowQuery,
  useCreateApprovalFlowMutation,
  useUpdateApprovalFlowMutation,
  useDeleteApprovalFlowMutation,
} = approvalFlowApi;

export default approvalFlowApi;
