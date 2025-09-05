import { sedarApi } from "..";

const filesempApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["FileEmp", "FileEmpMaster"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getShowFileTypesEmp: build.query({
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
          });

          // Only add search if it's not empty
          if (search && search.trim() !== "") {
            params.append("search", search.trim());
          }

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
