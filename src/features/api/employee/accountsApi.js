// src/features/api/employee/accountsApi.js

import { sedarApi } from "..";

const accountsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Account"] })
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
          result && result.data
            ? [
                { type: "Account", id: "LIST" },
                ...result.data.map(({ id }) => ({ type: "Account", id })),
              ]
            : [{ type: "Account", id: "LIST" }],
      }),

      // Update an existing account
      updateAccount: build.mutation({
        query: ({ id, ...data }) => ({
          url: `employees/accounts/${id}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "Account", id },
          { type: "Account", id: "LIST" },
        ],
      }),

      // Delete an account
      deleteAccount: build.mutation({
        query: (id) => ({
          url: `employees/accounts/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "Account", id },
          { type: "Account", id: "LIST" },
        ],
      }),
    }),
  });

export const {
  useGetAccountsQuery,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} = accountsApi;
