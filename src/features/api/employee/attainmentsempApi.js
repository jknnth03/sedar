import { sedarApi } from "..";

const attainmentsEmpApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Attainment", "AttainmentMaster"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // Fetch a paginated list of attainments
      getAttainments: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => ({
          url: `employees/attainments?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
        providesTags: (result) =>
          result && result.result && result.result.data
            ? [
                { type: "Attainment", id: "LIST" },
                ...result.result.data.map(({ id }) => ({
                  type: "Attainment",
                  id,
                })),
              ]
            : [{ type: "Attainment", id: "LIST" }],
      }),

      // Get all attainments (for dropdowns, etc.)
      getAllAttainments: build.query({
        query: ({
          page = 1,
          per_page = 100,
          status = "active",
          search = "",
        } = {}) => ({
          url: `employees/attainments?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
        providesTags: (result) =>
          result?.result?.data || result?.data || result
            ? [
                { type: "AttainmentMaster", id: "ALL" },
                ...(result?.result?.data || result?.data || result || []).map(
                  ({ id }) => ({
                    type: "AttainmentMaster",
                    id,
                  })
                ),
              ]
            : [{ type: "AttainmentMaster", id: "ALL" }],
      }),

      // Update attainment
      updateAttainment: build.mutation({
        query: ({ employeeId, attainmentId, ...data }) => ({
          url: `employees/${employeeId}/attainments/${attainmentId}`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: (result, error, { attainmentId }) => [
          { type: "Attainment", id: attainmentId },
          { type: "Attainment", id: "LIST" },
          { type: "AttainmentMaster", id: "ALL" },
        ],
      }),

      // Delete attainment
      deleteAttainment: build.mutation({
        query: ({ employeeId, attainmentId }) => ({
          url: `employees/${employeeId}/attainments/${attainmentId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { attainmentId }) => [
          { type: "Attainment", id: attainmentId },
          { type: "Attainment", id: "LIST" },
          { type: "AttainmentMaster", id: "ALL" },
        ],
      }),
    }),
  });

export const {
  useGetAttainmentsQuery,
  useGetAllAttainmentsQuery,
  useUpdateAttainmentMutation,
  useDeleteAttainmentMutation,
} = attainmentsEmpApi;

export default attainmentsEmpApi;
