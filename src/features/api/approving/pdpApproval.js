import { sedarApi } from "..";
import dashboardApi from "../usermanagement/dashboardApi";

const pdpApprovalApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["pdpApprovals"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getPdpApprovals: build.query({
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
            ? `da-approvals/pdp?${queryString}`
            : "da-approvals/pdp";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["pdpApprovals"],
      }),

      getPdpTaskById: build.query({
        query: (id) => ({
          url: `da-tasks/pdp/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [
          { type: "pdpApprovals", id },
          "pdpApprovals",
        ],
      }),

      approvePdp: build.mutation({
        query: ({ id, comments }) => {
          const body = {};
          if (comments && comments.trim()) {
            body.comments = comments.trim();
          }
          return {
            url: `da-approvals/pdp/${id}/approve`,
            method: "POST",
            body,
          };
        },
        invalidatesTags: (result, error, { id }) => [
          { type: "pdpApprovals", id },
          "pdpApprovals",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {
            console.error("Failed to approve PDP:", err);
          }
        },
      }),

      returnPdp: build.mutation({
        query: ({ id, correction_remarks }) => ({
          url: `da-approvals/pdp/${id}/return`,
          method: "POST",
          body: {
            correction_remarks,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "pdpApprovals", id },
          "pdpApprovals",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {
            console.error("Failed to return PDP:", err);
          }
        },
      }),
    }),
  });

export const {
  useGetPdpApprovalsQuery,
  useLazyGetPdpApprovalsQuery,
  useGetPdpTaskByIdQuery,
  useLazyGetPdpTaskByIdQuery,
  useApprovePdpMutation,
  useReturnPdpMutation,
} = pdpApprovalApi;

export default pdpApprovalApi;
