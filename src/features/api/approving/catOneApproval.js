import { sedarApi } from "..";

const catOneApprovalApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["catOneApprovals"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getCatOneApprovals: build.query({
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
            ? `da-approvals/cat1?${queryString}`
            : "da-approvals/cat1";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["catOneApprovals"],
      }),
      getCatOneTaskById: build.query({
        query: (id) => ({
          url: `da-tasks/cat1/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [{ type: "catOneApprovals", id }],
      }),
      approveCatOne: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `da-approvals/cat1/${id}/approve`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "catOneApprovals", id },
          "catOneApprovals",
        ],
      }),
      returnCatOne: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `da-approvals/cat1/${id}/return`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "catOneApprovals", id },
          "catOneApprovals",
        ],
      }),
    }),
  });

export const {
  useGetCatOneApprovalsQuery,
  useLazyGetCatOneApprovalsQuery,
  useGetCatOneTaskByIdQuery,
  useLazyGetCatOneTaskByIdQuery,
  useApproveCatOneMutation,
  useReturnCatOneMutation,
} = catOneApprovalApi;

export default catOneApprovalApi;
