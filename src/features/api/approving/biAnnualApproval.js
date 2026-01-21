import { sedarApi } from "..";
import dashboardApi from "../usermanagement/dashboardApi";

const biAnnualApprovalApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["biAnnualApprovals"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getMyBiAnnualApprovals: build.query({
        query: (params = {}) => {
          const {
            pagination = 1,
            page = 1,
            per_page = 10,
            status = "active",
            approval_status,
            search,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();
          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());
          queryParams.append("status", status);

          if (approval_status && approval_status.trim() !== "") {
            queryParams.append("approval_status", approval_status.trim());
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
            ? `me/performance-form-approvals?${queryString}`
            : "me/performance-form-approvals";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["biAnnualApprovals"],
      }),

      getBiAnnualApprovalById: build.query({
        query: (id) => ({
          url: `me/performance-approvals/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [
          { type: "biAnnualApprovals", id },
          "biAnnualApprovals",
        ],
      }),

      approveBiAnnualSubmission: build.mutation({
        query: ({ id, comments }) => {
          const body = {};
          if (comments && comments.trim()) {
            body.comments = comments.trim();
          }
          return {
            url: `submission-approvals/${id}/approve`,
            method: "POST",
            body,
          };
        },
        invalidatesTags: (result, error, { id }) => [
          { type: "biAnnualApprovals", id },
          "biAnnualApprovals",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {
            console.error("Failed to approve bi-annual submission:", err);
          }
        },
      }),

      rejectBiAnnualSubmission: build.mutation({
        query: ({ id, reason, comments }) => {
          const body = {
            reason: reason,
          };
          if (comments && comments.trim()) {
            body.comments = comments.trim();
          }
          return {
            url: `submission-approvals/${id}/reject`,
            method: "POST",
            body,
          };
        },
        invalidatesTags: (result, error, { id }) => [
          { type: "biAnnualApprovals", id },
          "biAnnualApprovals",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {
            console.error("Failed to reject bi-annual submission:", err);
          }
        },
      }),
    }),
  });

export const {
  useGetMyBiAnnualApprovalsQuery,
  useLazyGetMyBiAnnualApprovalsQuery,
  useGetBiAnnualApprovalByIdQuery,
  useLazyGetBiAnnualApprovalByIdQuery,
  useApproveBiAnnualSubmissionMutation,
  useRejectBiAnnualSubmissionMutation,
} = biAnnualApprovalApi;

export default biAnnualApprovalApi;
