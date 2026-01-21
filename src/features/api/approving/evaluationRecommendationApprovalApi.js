import { sedarApi } from "..";
import dashboardApi from "../usermanagement/dashboardApi";

const evaluationRecommendationApprovalApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["evaluationRecommendationApprovals"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getMyProbationaryRecommendationApprovals: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status = "active",
            search,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());
          queryParams.append("status", status);

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
            ? `me/probationary-recommendation-approvals?${queryString}`
            : "me/probationary-recommendation-approvals";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["evaluationRecommendationApprovals"],
      }),
      getProbationaryRecommendationApprovalById: build.query({
        query: (id) => ({
          url: `me/probationary-approvals/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [
          { type: "evaluationRecommendationApprovals", id },
          "evaluationRecommendationApprovals",
        ],
      }),
      approveRecommendation: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `submission-approvals/${id}/approve`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "evaluationRecommendationApprovals", id },
          "evaluationRecommendationApprovals",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {
            console.error("Failed to approve recommendation:", err);
          }
        },
      }),
      rejectRecommendation: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `submission-approvals/${id}/reject`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "evaluationRecommendationApprovals", id },
          "evaluationRecommendationApprovals",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {
            console.error("Failed to reject recommendation:", err);
          }
        },
      }),
    }),
  });

export const {
  useGetMyProbationaryRecommendationApprovalsQuery,
  useLazyGetMyProbationaryRecommendationApprovalsQuery,
  useGetProbationaryRecommendationApprovalByIdQuery,
  useLazyGetProbationaryRecommendationApprovalByIdQuery,
  useApproveRecommendationMutation,
  useRejectRecommendationMutation,
} = evaluationRecommendationApprovalApi;

export default evaluationRecommendationApprovalApi;
