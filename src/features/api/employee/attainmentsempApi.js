import { sedarApi } from "..";

const attainmentsEmpApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Attainment", "AttainmentMaster"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getAttainments: build.query({
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

          return { url: `employees/attainments?${params.toString()}` };
        },
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
      getAllAttainments: build.query({
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

          return { url: `employees/attainments?${params.toString()}` };
        },
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
      getAttainmentAttachment: build.query({
        query: (attainmentId) => ({
          url: `employees/attainments/${attainmentId}/attachment`,
          responseHandler: async (response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch attachment");
            }
            return await response.blob();
          },
        }),
        providesTags: (result, error, attainmentId) => [
          { type: "Attainment", id: attainmentId },
        ],
      }),
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
      deleteAttainment: build.mutation({
        query: (attainmentId) => {
          if (!attainmentId) {
            throw new Error("ID is required for attainment deletion");
          }
          return {
            url: `employees/attainments/${attainmentId}`,
            method: "DELETE",
          };
        },
        invalidatesTags: (result, error, attainmentId) => [
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
  useGetAttainmentAttachmentQuery,
  useUpdateAttainmentMutation,
  useDeleteAttainmentMutation,
} = attainmentsEmpApi;

export default attainmentsEmpApi;
