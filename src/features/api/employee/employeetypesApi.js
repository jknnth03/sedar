import { sedarApi } from "../index";

export const employeeTypesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["EmploymentType", "EmploymentTypeMaster"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // Fetch a paginated list of employment types
      getEmploymentTypes: build.query({
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

          return { url: `employees/employment-types?${params.toString()}` };
        },
        providesTags: (result) =>
          result && result.result && result.result.data
            ? [
                { type: "EmploymentType", id: "LIST" },
                ...result.result.data.map(({ id }) => ({
                  type: "EmploymentType",
                  id,
                })),
              ]
            : [{ type: "EmploymentType", id: "LIST" }],
      }),
      // Get all employment types (for dropdowns)
      getAllEmploymentTypes: build.query({
        query: ({
          page = 1,
          per_page = 100,
          status = "active",
          search = "",
          employment_status,
          statuses = [],
        } = {}) => {
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

          return { url: `employees/employment-types?${params.toString()}` };
        },
        providesTags: (result) =>
          result?.result?.data || result?.data || result
            ? [
                { type: "EmploymentTypeMaster", id: "ALL" },
                ...(result?.result?.data || result?.data || result || []).map(
                  ({ id }) => ({
                    type: "EmploymentTypeMaster",
                    id,
                  })
                ),
              ]
            : [{ type: "EmploymentTypeMaster", id: "ALL" }],
      }),
      // Update employment type
      updateEmploymentType: build.mutation({
        query: ({ id, ...data }) => ({
          url: `employees/employment-types/${id}`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "EmploymentType", id },
          { type: "EmploymentType", id: "LIST" },
          { type: "EmploymentTypeMaster", id: "ALL" },
        ],
      }),
    }),
  });

export const {
  useGetEmploymentTypesQuery,
  useGetAllEmploymentTypesQuery,
  useUpdateEmploymentTypeMutation,
} = employeeTypesApi;

export default employeeTypesApi;
