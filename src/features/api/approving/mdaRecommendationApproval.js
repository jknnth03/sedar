import { sedarApi } from "..";

const mdaRecommendationApprovalApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["mdaRecommendationApprovals"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getMyMdaRecommendationApprovals: build.query({
        query: (params = {}) => {
          const {
            pagination = 1,
            page = 1,
            per_page = 10,
            status = "active",
            search,
            approval_status = "",
            type = "da",
            stage = "final",
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());
          queryParams.append("status", status);
          queryParams.append("approval_status", approval_status);
          queryParams.append("type", type);
          queryParams.append("stage", stage);

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
        providesTags: ["mdaRecommendationApprovals"],
      }),
      getMdaRecommendationApprovalById: build.query({
        query: (id) => ({
          url: `me/mda-approvals/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [
          { type: "mdaRecommendationApprovals", id },
        ],
      }),
      approveMdaRecommendationSubmission: build.mutation({
        query: ({ id, comments }) => ({
          url: `submission-approvals/${id}/approve`,
          method: "POST",
          body: {
            comments,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "mdaRecommendationApprovals", id },
          "mdaRecommendationApprovals",
        ],
      }),
      rejectMdaRecommendationSubmission: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `submission-approvals/${id}/reject`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "mdaRecommendationApprovals", id },
          "mdaRecommendationApprovals",
        ],
      }),
    }),
  });

export const {
  useGetMyMdaRecommendationApprovalsQuery,
  useLazyGetMyMdaRecommendationApprovalsQuery,
  useGetMdaRecommendationApprovalByIdQuery,
  useLazyGetMdaRecommendationApprovalByIdQuery,
  useApproveMdaRecommendationSubmissionMutation,
  useRejectMdaRecommendationSubmissionMutation,
} = mdaRecommendationApprovalApi;

export default mdaRecommendationApprovalApi;
