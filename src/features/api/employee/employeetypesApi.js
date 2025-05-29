import { sedarApi } from "..";

const employeeTypesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["EmployeeType"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // Fetch a paginated list of employee employment types
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
                { type: "EmployeeType", id: "LIST" },
                ...result.result.data.map(({ id }) => ({
                  type: "EmployeeType",
                  id,
                })),
              ]
            : [{ type: "EmployeeType", id: "LIST" }],
      }),

      // Delete an employment type by ID
      deleteEmploymentType: build.mutation({
        query: (id) => ({
          url: `employees/employment-types/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "EmployeeType", id },
          { type: "EmployeeType", id: "LIST" },
        ],
      }),
    }),
  });

export const { useGetEmploymentTypesQuery, useDeleteEmploymentTypeMutation } =
  employeeTypesApi;
