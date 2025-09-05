import { sedarApi } from "../index";

export const positionsempApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Position"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getPosition: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
          employment_status,
          statuses = [],
        }) => {
          const params = new URLSearchParams({
            pagination: "1",
            page: page.toString(),
            per_page: per_page.toString(),
            status,
            search,
          });

          // Handle single employment_status
          if (employment_status) {
            params.append("employment_status", employment_status);
          }

          // Handle multiple statuses - send as comma-separated or multiple employment_status params
          if (statuses && statuses.length > 0) {
            // Option 1: Send as comma-separated string
            params.append("employment_status", statuses.join(","));

            // Option 2: Send as multiple employment_status parameters (uncomment if needed)
            // statuses.forEach(status => {
            //   params.append("employment_status", status);
            // });
          }

          return { url: `employees/positions?${params.toString()}` };
        },
        providesTags: (result) =>
          result?.result?.data
            ? [
                { type: "Position", id: "LIST" },
                ...result.result.data.map(({ id }) => ({
                  type: "Position",
                  id,
                })),
              ]
            : [{ type: "Position", id: "LIST" }],
      }),
      getAllPosition: build.query({
        query: ({ employment_status, statuses = [] } = {}) => {
          const params = new URLSearchParams();

          // Handle single employment_status
          if (employment_status) {
            params.append("employment_status", employment_status);
          }

          // Handle multiple statuses - send as comma-separated or multiple employment_status params
          if (statuses && statuses.length > 0) {
            // Option 1: Send as comma-separated string
            params.append("employment_status", statuses.join(","));

            // Option 2: Send as multiple employment_status parameters (uncomment if needed)
            // statuses.forEach(status => {
            //   params.append("employment_status", status);
            // });
          }

          const queryString = params.toString();
          return {
            url: `employees/positions${queryString ? `?${queryString}` : ""}`,
          };
        },
        providesTags: (result) =>
          result?.result?.data
            ? [
                { type: "Position", id: "ALL" },
                ...result.result.data.map(({ id }) => ({
                  type: "Position",
                  id,
                })),
              ]
            : [{ type: "Position", id: "ALL" }],
      }),
      getPositionById: build.query({
        query: (employeeId) => ({
          url: `employees/${employeeId}/position`,
        }),
        providesTags: (result, error, employeeId) => [
          { type: "Position", id: employeeId },
        ],
      }),
      updatePositionsEmp: build.mutation({
        query: ({ employeeId, ...data }) => ({
          url: `employees/${employeeId}/position`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: (result, error, { employeeId }) => [
          { type: "Position", id: employeeId },
          { type: "Position", id: "LIST" },
          { type: "Position", id: "ALL" },
        ],
      }),
      deletePosition: build.mutation({
        query: (employeeId) => {
          if (!employeeId) {
            throw new Error("Employee ID is required for position deletion");
          }
          return {
            url: `employees/${employeeId}/position`,
            method: "DELETE",
          };
        },
        invalidatesTags: (result, error, employeeId) => [
          { type: "Position", id: employeeId },
          { type: "Position", id: "LIST" },
          { type: "Position", id: "ALL" },
        ],
      }),
    }),
  });

export const {
  useGetPositionQuery,
  useGetAllPositionQuery,
  useUpdatePositionsEmpMutation,
  useDeletePositionMutation,
  useGetPositionByIdQuery,
} = positionsempApi;

export default positionsempApi;
