import { sedarApi } from "..";

const filesEmpApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["File"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // Fetch a paginated list of files
      getFiles: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => ({
          url: `employees/files?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
        providesTags: (result) =>
          result && result.data
            ? [
                { type: "File", id: "LIST" },
                ...result.data.map(({ id }) => ({ type: "File", id })),
              ]
            : [{ type: "File", id: "LIST" }],
      }),

      updateFile: build.mutation({
        query: ({ id, ...data }) => ({
          url: `employees/files/${id}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "File", id },
          { type: "File", id: "LIST" },
        ],
      }),

      deleteFile: build.mutation({
        query: (id) => ({
          url: `employees/files/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "File", id },
          { type: "File", id: "LIST" },
        ],
      }),
    }),
  });

export const {
  useGetFilesQuery,
  useUpdateFileMutation,
  useDeleteFileMutation,
} = filesEmpApi;
