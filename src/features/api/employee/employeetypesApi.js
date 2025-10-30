import { sedarApi } from "../index";

export const employeeTypesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["EmploymentType", "EmploymentTypeMaster"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getEmploymentTypes: build.query({
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
          statuses = [],
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

          if (statuses && statuses.length > 0) {
            params.append("statuses", statuses.join(","));
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

          if (employment_status) {
            params.append("employment_status", employment_status);
          }

          if (statuses && statuses.length > 0) {
            params.append("employment_status", statuses.join(","));
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
      deleteEmploymentType: build.mutation({
        query: (id) => {
          if (!id) {
            throw new Error("ID is required for employment type deletion");
          }
          return {
            url: `employees/employment-types/${id}`,
            method: "DELETE",
          };
        },
        invalidatesTags: (result, error, id) => [
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
  useDeleteEmploymentTypeMutation,
} = employeeTypesApi;

export default employeeTypesApi;
