import { sedarApi } from "../index";

export const positionsempApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Position"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getPosition: build.query({
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

          if (employment_status) {
            params.append("employment_status", employment_status);
          }

          if (statuses && statuses.length > 0) {
            params.append("employment_status", statuses.join(","));
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
