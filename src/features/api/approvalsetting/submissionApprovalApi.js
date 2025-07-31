import { sedarApi } from "..";

const submissionApprovalApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["submissionApprovals"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getMySubmissionApprovals: build.query({
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
            ? `me/submission-approvals?${queryString}`
            : "me/submission-approvals";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["submissionApprovals"],
      }),
      getSingleSubmissionApproval: build.query({
        query: (submissionApprovalId) => ({
          url: `submission-approvals/${submissionApprovalId}`,
          method: "GET",
        }),
        providesTags: (result, error, submissionApprovalId) => [
          { type: "submissionApprovals", id: submissionApprovalId },
          "submissionApprovals",
        ],
      }),
      approveSubmission: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `submission-approvals/${id}/approve`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "submissionApprovals", id },
          "submissionApprovals",
        ],
      }),
      rejectSubmission: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `submission-approvals/${id}/reject`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "submissionApprovals", id },
          "submissionApprovals",
        ],
      }),
      approveRejectSubmission: build.mutation({
        query: ({ id, decision, comments, reason }) => ({
          url: `submission-approvals/${id}/decision`,
          method: "POST",
          body: {
            _method: "PUT",
            decision,
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "submissionApprovals", id },
          "submissionApprovals",
        ],
      }),
    }),
  });

export const {
  useGetMySubmissionApprovalsQuery,
  useLazyGetMySubmissionApprovalsQuery,
  useGetSingleSubmissionApprovalQuery,
  useLazyGetSingleSubmissionApprovalQuery,
  useApproveSubmissionMutation,
  useRejectSubmissionMutation,
  useApproveRejectSubmissionMutation,
} = submissionApprovalApi;

export default submissionApprovalApi;
