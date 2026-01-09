import { sedarApi } from "..";
import dashboardApi from "../usermanagement/dashboardApi";

const mdaEvaluationApprovalApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["mdaEvaluationApprovals"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getMDAEvaluationApprovals: build.query({
        query: (params = {}) => {
          const {
            pagination = 1,
            page = 1,
            per_page = 10,
            status = "active",
            search,
            approval_status = "",
            type = "probationary-evaluation",
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());
          queryParams.append("status", status);
          queryParams.append("approval_status", approval_status);
          queryParams.append("type", type);

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
            ? `me/mda-approvals?${queryString}`
            : "me/mda-approvals";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["mdaEvaluationApprovals"],
      }),
      getMDAEvaluationApprovalById: build.query({
        query: (id) => ({
          url: `me/mda-approvals/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [
          { type: "mdaEvaluationApprovals", id },
          "mdaEvaluationApprovals",
        ],
      }),
      approveMDAEvaluationApproval: build.mutation({
        query: (id) => ({
          url: `submission-approvals/${id}/approve`,
          method: "POST",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "mdaEvaluationApprovals", id },
          "mdaEvaluationApprovals",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {
            console.error("Failed to approve MDA evaluation:", err);
          }
        },
      }),
      rejectMDAEvaluationApproval: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `submission-approvals/${id}/reject`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "mdaEvaluationApprovals", id },
          "mdaEvaluationApprovals",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {
            console.error("Failed to reject MDA evaluation:", err);
          }
        },
      }),
    }),
  });

export const {
  useGetMDAEvaluationApprovalsQuery,
  useLazyGetMDAEvaluationApprovalsQuery,
  useGetMDAEvaluationApprovalByIdQuery,
  useLazyGetMDAEvaluationApprovalByIdQuery,
  useApproveMDAEvaluationApprovalMutation,
  useRejectMDAEvaluationApprovalMutation,
} = mdaEvaluationApprovalApi;

export default mdaEvaluationApprovalApi;
