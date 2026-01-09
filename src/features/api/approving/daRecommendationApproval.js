import { sedarApi } from "..";
import { dashboardApi } from "../usermanagement/dashboardApi"; // ← IMPORT DASHBOARD API

const daRecommendationApprovalApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["daRecommendationApprovals"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getMyDaRecommendationApprovals: build.query({
        query: (params = {}) => {
          const {
            pagination = 1,
            page = 1,
            per_page = 10,
            status = "active",
            search,
            approval_status = "",
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

          const queryString = queryParams.toString();
          const url = queryString
            ? `me/da-recommendation-approvals?${queryString}`
            : "me/da-recommendation-approvals";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["daRecommendationApprovals"],
      }),
      getDaRecommendationApprovalById: build.query({
        query: (id) => ({
          url: `me/da-approvals/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [
          { type: "daRecommendationApprovals", id },
        ],
      }),
      approveDaRecommendationSubmission: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `submission-approvals/${id}/approve`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "daRecommendationApprovals", id },
          "daRecommendationApprovals",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {
            console.error("Failed to approve DA recommendation:", err);
          }
        },
      }),
      rejectDaRecommendationSubmission: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `submission-approvals/${id}/reject`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "daRecommendationApprovals", id },
          "daRecommendationApprovals",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {
            console.error("Failed to reject DA recommendation:", err);
          }
        },
      }),
    }),
  });

export const {
  useGetMyDaRecommendationApprovalsQuery,
  useLazyGetMyDaRecommendationApprovalsQuery,
  useGetDaRecommendationApprovalByIdQuery,
  useLazyGetDaRecommendationApprovalByIdQuery,
  useApproveDaRecommendationSubmissionMutation,
  useRejectDaRecommendationSubmissionMutation,
} = daRecommendationApprovalApi;

export default daRecommendationApprovalApi;
