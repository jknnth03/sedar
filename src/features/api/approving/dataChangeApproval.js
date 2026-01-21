import { sedarApi } from "..";
import dashboardApi from "../usermanagement/dashboardApi";

const dataChangeApprovalApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["dataChangeApprovals"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getMyDataChangeApprovals: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status = "active",
            search,
            approval_status = "pending",
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
            ? `me/data-change-approvals?${queryString}`
            : "me/data-change-approvals";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["dataChangeApprovals"],
      }),
      getDataChangeApprovalById: build.query({
        query: (id) => ({
          url: `me/data-change-approvals/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [
          { type: "dataChangeApprovals", id },
        ],
      }),
      approveDataChange: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `submission-approvals/${id}/approve`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "dataChangeApprovals", id },
          "dataChangeApprovals",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {
            console.error("Failed to approve data change:", err);
          }
        },
      }),
      rejectDataChange: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `submission-approvals/${id}/reject`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "dataChangeApprovals", id },
          "dataChangeApprovals",
        ],

        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {
            console.error("Failed to reject data change:", err);
          }
        },
      }),
    }),
  });

export const {
  useGetMyDataChangeApprovalsQuery,
  useLazyGetMyDataChangeApprovalsQuery,
  useGetDataChangeApprovalByIdQuery,
  useLazyGetDataChangeApprovalByIdQuery,
  useApproveDataChangeMutation,
  useRejectDataChangeMutation,
} = dataChangeApprovalApi;

export default dataChangeApprovalApi;
