import { sedarApi } from "..";
import dashboardApi from "../usermanagement/dashboardApi";

const catTwoApprovalApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["catTwoApprovals"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getCatTwoApprovals: build.query({
        query: (params = {}) => {
          const {
            pagination = 1,
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
            ? `da-approvals/cat2?${queryString}`
            : "da-approvals/cat2";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["catTwoApprovals"],
      }),

      getCatTwoTaskById: build.query({
        query: (id) => ({
          url: `da-tasks/cat2/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [
          { type: "catTwoApprovals", id },
          "catTwoApprovals",
        ],
      }),

      approveCatTwo: build.mutation({
        query: ({ id, comments }) => {
          const body = {};
          if (comments && comments.trim()) {
            body.comments = comments.trim();
          }
          return {
            url: `da-approvals/cat2/${id}/approve`,
            method: "POST",
            body,
          };
        },
        invalidatesTags: (result, error, { id }) => [
          { type: "catTwoApprovals", id },
          "catTwoApprovals",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {
            console.error("Failed to approve Cat 2:", err);
          }
        },
      }),

      returnCatTwo: build.mutation({
        query: ({ id, correction_remarks }) => ({
          url: `da-approvals/cat2/${id}/return`,
          method: "POST",
          body: {
            correction_remarks,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "catTwoApprovals", id },
          "catTwoApprovals",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {
            console.error("Failed to return Cat 2:", err);
          }
        },
      }),
    }),
  });

export const {
  useGetCatTwoApprovalsQuery,
  useLazyGetCatTwoApprovalsQuery,
  useGetCatTwoTaskByIdQuery,
  useLazyGetCatTwoTaskByIdQuery,
  useApproveCatTwoMutation,
  useReturnCatTwoMutation,
} = catTwoApprovalApi;

export default catTwoApprovalApi;
