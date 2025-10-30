import { sedarApi } from "..";

const accountsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Account", "AccountMaster"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getAccounts: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "all",
          search = "",
          pagination = 1,
          employment_status,
          employee_name,
          team_name,
          id_number,
          date_hired_from,
          date_hired_to,
          employment_type,
          department_name,
          position_title,
          manpower_form,
        }) => {
          const params = new URLSearchParams({
            pagination: pagination.toString(),
            page: page.toString(),
            per_page: per_page.toString(),
            status,
          });

          if (search && search.trim()) {
            params.append("search", search);
          }

          if (employment_status) {
            params.append("employment_status", employment_status);
          }

          if (employee_name) {
            params.append("employee_name", employee_name);
          }

          if (team_name) {
            params.append("team_name", team_name);
          }

          if (id_number) {
            params.append("id_number", id_number);
          }

          if (date_hired_from) {
            params.append("date_hired_from", date_hired_from);
          }

          if (date_hired_to) {
            params.append("date_hired_to", date_hired_to);
          }

          if (employment_type) {
            params.append("employment_type", employment_type);
          }

          if (department_name) {
            params.append("department_name", department_name);
          }

          if (position_title) {
            params.append("position_title", position_title);
          }

          if (manpower_form) {
            params.append("manpower_form", manpower_form);
          }

          return { url: `employees/accounts?${params.toString()}` };
        },
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

      updateAccount: build.mutation({
        query: ({ employeeId, accountId, ...data }) => ({
          url: `employees/${employeeId}/accounts`,
          method: "PATCH",
          body: {
            account_id: accountId,
            ...data,
          },
        }),
        invalidatesTags: [
          { type: "Account", id: "LIST" },
          { type: "AccountMaster", id: "ALL" },
        ],
      }),

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
