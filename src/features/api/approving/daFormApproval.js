import { sedarApi } from "..";
import dashboardApi from "../usermanagement/dashboardApi";

const daFormApprovalApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["daFormApprovals"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getMyDaApprovals: build.query({
        query: (params = {}) => {
          const {
            pagination = 1,
            page = 1,
            per_page = 10,
            status = "active",
            approval_status = "",
            search = "",
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());
          queryParams.append("status", status);
          queryParams.append("approval_status", approval_status);

          if (search && search.trim() !== "") {
            queryParams.append("search", search.trim());
          }

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });

          return {
            url: `me/da-form-approvals?${queryParams.toString()}`,
            method: "GET",
          };
        },
        providesTags: ["daFormApprovals"],
      }),
      getDaApprovalById: build.query({
        query: (id) => ({
          url: `me/da-approvals/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [
          { type: "daFormApprovals", id },
          "daFormApprovals",
        ],
      }),
      approveDaSubmission: build.mutation({
        query: ({ submissionId, comments, reason }) => ({
          url: `submission-approvals/${submissionId}/approve`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { submissionId }) => [
          { type: "daFormApprovals", id: submissionId },
          "daFormApprovals",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {
            console.error("Failed to approve DA submission:", err);
          }
        },
      }),
      rejectDaSubmission: build.mutation({
        query: ({ submissionId, comments, reason }) => ({
          url: `submission-approvals/${submissionId}/reject`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { submissionId }) => [
          { type: "daFormApprovals", id: submissionId },
          "daFormApprovals",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {
            console.error("Failed to reject DA submission:", err);
          }
        },
      }),
    }),
  });

export const {
  useGetMyDaApprovalsQuery,
  useLazyGetMyDaApprovalsQuery,
  useGetDaApprovalByIdQuery,
  useLazyGetDaApprovalByIdQuery,
  useApproveDaSubmissionMutation,
  useRejectDaSubmissionMutation,
} = daFormApprovalApi;

export default daFormApprovalApi;
