import { sedarApi } from "..";

const filesempApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["FileEmp", "FileEmpMaster"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getShowFileTypesEmp: build.query({
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

          return { url: `employees/files?${params.toString()}` };
        },
        providesTags: (result) =>
          result && result.result && result.result.data
            ? [
                { type: "FileEmp", id: "LIST" },
                ...result.result.data.map(({ id }) => ({
                  type: "FileEmp",
                  id,
                })),
              ]
            : [{ type: "FileEmp", id: "LIST" }],
      }),

      getFileEmpAttachment: build.query({
        query: (fileId) => {
          if (!fileId || fileId === "undefined" || fileId === "null") {
            throw new Error("Invalid file ID provided");
          }

          return {
            url: `employees/files/${fileId}/attachment`,
            responseHandler: (response) => response.blob(),
          };
        },
        providesTags: (result, error, fileId) => [
          { type: "FileEmp", id: fileId },
        ],
        transformErrorResponse: (response, meta, arg) => {
          console.error("File attachment error:", response, "for fileId:", arg);
          return response;
        },
      }),

      deleteFileTypesEmp: build.mutation({
        query: ({ employeeId, fileId }) => ({
          url: `employees/${employeeId}/files/${fileId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { fileId }) => [
          { type: "FileEmp", id: fileId },
          { type: "FileEmp", id: "LIST" },
          { type: "FileEmpMaster", id: "ALL" },
        ],
      }),

      createFileTypesEmp: build.mutation({
        query: ({ employeeId, ...data }) => {
          const formData = new FormData();
          Object.keys(data).forEach((key) => {
            if (data[key] !== null && data[key] !== undefined) {
              formData.append(key, data[key]);
            }
          });

          return {
            url: `employees/${employeeId}/files`,
            method: "POST",
            body: formData,
            formData: true,
          };
        },
        invalidatesTags: [
          { type: "FileEmp", id: "LIST" },
          { type: "FileEmpMaster", id: "ALL" },
        ],
      }),

      updateFileTypesEmp: build.mutation({
        query: ({ employeeId, fileId, ...data }) => {
          const formData = new FormData();
          Object.keys(data).forEach((key) => {
            if (data[key] !== null && data[key] !== undefined) {
              formData.append(key, data[key]);
            }
          });

          return {
            url: `employees/${employeeId}/files/${fileId}`,
            method: "PATCH",
            body: formData,
            formData: true,
          };
        },
        invalidatesTags: (result, error, { fileId }) => [
          { type: "FileEmp", id: fileId },
          { type: "FileEmp", id: "LIST" },
          { type: "FileEmpMaster", id: "ALL" },
        ],
      }),

      getEmployeeFiles: build.query({
        query: ({
          employeeId,
          page = 1,
          per_page = 10,
          employment_status,
          statuses = [],
        }) => {
          const params = new URLSearchParams({
            page: page.toString(),
            per_page: per_page.toString(),
          });

          if (employment_status) {
            params.append("employment_status", employment_status);
          }

          if (statuses && statuses.length > 0) {
            params.append("employment_status", statuses.join(","));
          }

          return { url: `employees/${employeeId}/files?${params.toString()}` };
        },
        providesTags: (result, error, { employeeId }) => [
          { type: "FileEmp", id: `EMPLOYEE_${employeeId}` },
        ],
      }),
    }),
  });

export const {
  useGetShowFileTypesEmpQuery,
  useGetFileEmpAttachmentQuery,
  useDeleteFileTypesEmpMutation,
  useCreateFileTypesEmpMutation,
  useUpdateFileTypesEmpMutation,
  useGetEmployeeFilesQuery,
} = filesempApi;

export default filesempApi;
