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

      // Add other file-related endpoints as needed
      createFileTypesEmp: build.mutation({
        query: ({ employeeId, ...data }) => ({
          url: `employees/${employeeId}/files`,
          method: "POST",
          body: data,
        }),
        invalidatesTags: [
          { type: "FileEmp", id: "LIST" },
          { type: "FileEmpMaster", id: "ALL" },
        ],
      }),

      updateFileTypesEmp: build.mutation({
        query: ({ employeeId, fileId, ...data }) => ({
          url: `employees/${employeeId}/files/${fileId}`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: (result, error, { fileId }) => [
          { type: "FileEmp", id: fileId },
          { type: "FileEmp", id: "LIST" },
          { type: "FileEmpMaster", id: "ALL" },
        ],
      }),
    }),
  });

export const {
  useGetShowFileTypesEmpQuery,
  useDeleteFileTypesEmpMutation,
  useCreateFileTypesEmpMutation,
  useUpdateFileTypesEmpMutation,
} = filesempApi;

export default filesempApi;
