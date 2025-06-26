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
        }) => ({
          url: `employees/employment-types?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
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
        } = {}) => ({
          url: `employees/employment-types?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
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
