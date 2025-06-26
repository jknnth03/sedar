import { sedarApi } from "../index";

export const statusApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Status", "StatusMaster"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // Fetch a paginated list of statuses
      getStatus: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => ({
          // Option 1: Use absolute path from domain root
          url: `/employees/statuses?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,

          // Option 2: Override baseUrl for this specific endpoint
          // baseUrl: '/',
        }),
        providesTags: (result) =>
          result && result.result && result.result.data
            ? [
                { type: "Status", id: "LIST" },
                ...result.result.data.map(({ id }) => ({
                  type: "Status",
                  id,
                })),
              ]
            : [{ type: "Status", id: "LIST" }],
      }),

      // Get all statuses for dropdowns
      getAllStatuses: build.query({
        query: ({
          page = 1,
          per_page = 100,
          status = "active",
          search = "",
        } = {}) => ({
          url: `/employees/statuses?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
        providesTags: (result) =>
          result?.result?.data || result?.data || result
            ? [
                { type: "StatusMaster", id: "ALL" },
                ...(result?.result?.data || result?.data || result || []).map(
                  ({ id }) => ({
                    type: "StatusMaster",
                    id,
                  })
                ),
              ]
            : [{ type: "StatusMaster", id: "ALL" }],
      }),

      // Get status by employee ID
      getStatusByEmployeeId: build.query({
        query: (employeeId) => ({
          url: `/employees/${employeeId}/status`,
        }),
        providesTags: (result, error, employeeId) => [
          { type: "Status", id: employeeId },
        ],
      }),

      // Update status
      updateStatus: build.mutation({
        query: ({ employee_id, ...data }) => ({
          url: `/employees/${employee_id}/statuses`,
          method: "POST",
          body: data,
        }),
        invalidatesTags: (result, error, { employee_id }) => [
          { type: "Status", id: employee_id },
          { type: "Status", id: "LIST" },
          { type: "StatusMaster", id: "ALL" },
        ],
      }),

      // Delete status
      deleteStatus: build.mutation({
        query: (id) => ({
          url: `/employees/statuses/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "Status", id },
          { type: "Status", id: "LIST" },
          { type: "StatusMaster", id: "ALL" },
        ],
      }),
    }),
  });

export const {
  useGetStatusQuery,
  useGetAllStatusesQuery,
  useGetStatusByEmployeeIdQuery,
  useUpdateStatusMutation,
  useDeleteStatusMutation,
} = statusApi;

export default statusApi;
