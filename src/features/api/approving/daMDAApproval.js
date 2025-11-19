import { sedarApi } from "..";

const daMdaApprovalApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["daMdaApprovals"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getMyDaMdaApprovals: build.query({
        query: (params = {}) => {
          const {
            pagination = 1,
            page = 1,
            per_page = 10,
            status = "active",
            search,
            approval_status = "pending",
            type = "da",
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
        providesTags: ["daMdaApprovals"],
      }),
      getDaMdaApprovalById: build.query({
        query: (id) => ({
          url: `me/mda-approvals/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [{ type: "daMdaApprovals", id }],
      }),
      approveDaMdaSubmission: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `submission-approvals/${id}/approve`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "daMdaApprovals", id },
          "daMdaApprovals",
        ],
      }),
      rejectDaMdaSubmission: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `submission-approvals/${id}/reject`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "daMdaApprovals", id },
          "daMdaApprovals",
        ],
      }),
    }),
  });

export const {
  useGetMyDaMdaApprovalsQuery,
  useLazyGetMyDaMdaApprovalsQuery,
  useGetDaMdaApprovalByIdQuery,
  useLazyGetDaMdaApprovalByIdQuery,
  useApproveDaMdaSubmissionMutation,
  useRejectDaMdaSubmissionMutation,
} = daMdaApprovalApi;

export default daMdaApprovalApi;
