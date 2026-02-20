import { sedarApi } from "..";
import dashboardApi from "../usermanagement/dashboardApi";

const pdpTwoApprovalApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["pdpTwoApprovals"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getPdpTwoApprovals: build.query({
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
          queryParams.append("type", "PDP2");

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
            ? `da-approvals/pdp?${queryString}`
            : "da-approvals/pdp";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["pdpTwoApprovals"],
      }),

      getPdpTwoTaskById: build.query({
        query: (id) => ({
          url: `da-tasks/pdp/${id}?type=PDP2`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [
          { type: "pdpTwoApprovals", id },
          "pdpTwoApprovals",
        ],
      }),

      approvePdpTwo: build.mutation({
        query: ({ id, comments }) => {
          const body = { type: "PDP2" };
          if (comments && comments.trim()) {
            body.comments = comments.trim();
          }
          return {
            url: `da-approvals/pdp/${id}/approve?type=PDP2`,
            method: "POST",
            body,
          };
        },
        invalidatesTags: (result, error, { id }) => [
          { type: "pdpTwoApprovals", id },
          "pdpTwoApprovals",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"]),
            );
          } catch (err) {
            console.error("Failed to approve PDP2:", err);
          }
        },
      }),

      returnPdpTwo: build.mutation({
        query: ({ id, correction_remarks }) => ({
          url: `da-approvals/pdp/${id}/return?type=PDP2`,
          method: "POST",
          body: {
            correction_remarks,
            type: "PDP2",
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "pdpTwoApprovals", id },
          "pdpTwoApprovals",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"]),
            );
          } catch (err) {
            console.error("Failed to return PDP2:", err);
          }
        },
      }),
    }),
  });

export const {
  useGetPdpTwoApprovalsQuery,
  useLazyGetPdpTwoApprovalsQuery,
  useGetPdpTwoTaskByIdQuery,
  useLazyGetPdpTwoTaskByIdQuery,
  useApprovePdpTwoMutation,
  useReturnPdpTwoMutation,
} = pdpTwoApprovalApi;

export default pdpTwoApprovalApi;
