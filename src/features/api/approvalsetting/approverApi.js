import { sedarApi } from "..";

const approverApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["approvers"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getApprovers: build.query({
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

          // Convert boolean to 1/0
          queryParams.append("pagination", pagination ? "1" : "0");
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());
          queryParams.append("status", status);

          // Always append search, even if empty
          queryParams.append("search", search ? search.trim() : "");

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });

          const queryString = queryParams.toString();
          const url = queryString
            ? `users/approvers?${queryString}` // Fixed: was users/receivers
            : "users/approvers"; // Fixed: was users/receivers

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["approvers"],
      }),
      getAllApprovers: build.query({
        query: (params = {}) => {
          const {
            pagination = false, // Default to false for "get all"
            status = "active",
            search,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          // Convert boolean to 1/0
          queryParams.append("pagination", pagination ? "1" : "0");
          queryParams.append("status", status);

          // Always append search, even if empty
          queryParams.append("search", search ? search.trim() : "");

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });

          const queryString = queryParams.toString();
          const url = queryString
            ? `users/approvers?${queryString}` // Fixed: was users/receivers
            : "users/approvers"; // Fixed: was users/receivers

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["approvers"],
      }),
      createApprover: build.mutation({
        query: (body) => ({
          url: "users/approvers",
          method: "POST",
          body,
        }),
        invalidatesTags: ["approvers"],
      }),
      deleteApprover: build.mutation({
        query: (approverId) => ({
          url: `users/approvers/${approverId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, approverId) => [
          { type: "approvers", id: approverId },
          "approvers",
        ],
      }),
    }),
  });

export const {
  useGetApproversQuery,
  useGetAllApproversQuery,
  useLazyGetAllApproversQuery,
  useCreateApproverMutation,
  useDeleteApproverMutation,
} = approverApi;

export default approverApi;
