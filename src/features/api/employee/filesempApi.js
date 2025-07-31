// src/features/api/employee/filesempApi.js

import { sedarApi } from "..";

const filesempApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["FileEmp", "FileEmpMaster"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // Get files with proper query structure
      getShowFileTypesEmp: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => {
          let url = `employees/files?pagination=1&page=${page}&per_page=${per_page}&status=${status}`;

          // Only add search parameter if it has a value
          if (search && search.trim() !== "") {
            url += `&search=${encodeURIComponent(search.trim())}`;
          }

          return { url };
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

      // Get file attachment for showing/viewing - FIXED
      getFileEmpAttachment: build.query({
        query: (fileId) => {
          // Validate fileId before making the request
          if (!fileId || fileId === "undefined" || fileId === "null") {
            throw new Error("Invalid file ID provided");
          }

          return {
            url: `employees/files/${fileId}/attachment`,
            responseHandler: (response) => response.blob(), // Handle file download properly
          };
        },
        providesTags: (result, error, fileId) => [
          { type: "FileEmp", id: fileId },
        ],
        // Add error handling
        transformErrorResponse: (response, meta, arg) => {
          console.error("File attachment error:", response, "for fileId:", arg);
          return response;
        },
      }),

      // Delete/Archive file
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

      // Create file with proper FormData handling
      createFileTypesEmp: build.mutation({
        query: ({ employeeId, ...data }) => {
          // Handle FormData for file uploads
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
            formData: true, // This tells RTK Query not to JSON.stringify
          };
        },
        invalidatesTags: [
          { type: "FileEmp", id: "LIST" },
          { type: "FileEmpMaster", id: "ALL" },
        ],
      }),

      // Update file with proper FormData handling
      updateFileTypesEmp: build.mutation({
        query: ({ employeeId, fileId, ...data }) => {
          // Handle FormData for file uploads
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

      // Get specific employee files
      getEmployeeFiles: build.query({
        query: ({ employeeId, page = 1, per_page = 10 }) => ({
          url: `employees/${employeeId}/files?page=${page}&per_page=${per_page}`,
        }),
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
