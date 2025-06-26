// src/features/api/employee/accountsApi.js

import { sedarApi } from "..";

const accountsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Account", "AccountMaster"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // Fetch a paginated list of accounts
      getAccounts: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => ({
          url: `employees/accounts?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
        providesTags: (result) =>
          result && result.result && result.result.data
            ? [
                { type: "Account", id: "LIST" },
                ...result.result.data.map(({ id }) => ({
                  type: "Account",
                  id,
                })),
              ]
            : [{ type: "Account", id: "LIST" }],
      }),

      // Get all accounts (for dropdowns, unpaginated or larger sets)
      getAllAccounts: build.query({
        query: ({
          page = 1,
          per_page = 100,
          status = "active",
          search = "",
        } = {}) => ({
          url: `employees/accounts?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
        providesTags: (result) =>
          result?.result?.data || result?.data || result
            ? [
                { type: "AccountMaster", id: "ALL" },
                ...(result?.result?.data || result?.data || result || []).map(
                  ({ id }) => ({
                    type: "AccountMaster",
                    id,
                  })
                ),
              ]
            : [{ type: "AccountMaster", id: "ALL" }],
      }),

      // Update account using POST
      updateAccount: build.mutation({
        query: ({ employeeId, accountId, ...data }) => ({
          url: `employees/${employeeId}/accounts`,
          method: "PATCH",
          body: {
            account_id: accountId, // Include accountId in the body
            ...data,
          },
        }),
        invalidatesTags: [
          { type: "Account", id: "LIST" },
          { type: "AccountMaster", id: "ALL" },
        ],
      }),

      // Delete an account
      deleteAccount: build.mutation({
        query: ({ employeeId, accountId }) => ({
          url: `employees/${employeeId}/accounts/${accountId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { accountId }) => [
          { type: "Account", id: accountId },
          { type: "Account", id: "LIST" },
          { type: "AccountMaster", id: "ALL" },
        ],
      }),
    }),
  });

export const {
  useGetAccountsQuery,
  useGetAllAccountsQuery,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} = accountsApi;

export default accountsApi;
