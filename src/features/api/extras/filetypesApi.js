import { sedarApi } from "..";

const fileTypesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["file-types"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postFileTypes: build.mutation({
        query: (body) => ({
          url: "file-types",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["file-types"],
      }),

      getShowFileTypes: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status,
          search = "",
          pagination = true,
        }) => {
          const queryParams = new URLSearchParams();

          queryParams.append("page", page);
          queryParams.append("per_page", per_page);
          queryParams.append("pagination", pagination);

          if (status) queryParams.append("status", status);
          if (search) queryParams.append("search", search);

          return { url: `file-types?${queryParams.toString()}` };
        },
        providesTags: ["file-types"],
      }),

      getAllFileTypes: build.query({
        query: () => ({
          url: "file-types?pagination=none&status=active",
        }),
        providesTags: ["file-types"],
      }),

      updateFileTypes: build.mutation({
        query: ({ id, ...body }) => ({
          url: `file-types/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["file-types"],
      }),

      deleteFileTypes: build.mutation({
        query: (id) => ({
          url: `file-types/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["file-types"],
      }),
    }),
  });

export const {
  usePostFileTypesMutation,
  useGetShowFileTypesQuery,
  useLazyGetShowFileTypesQuery, // Added lazy version
  useGetAllFileTypesQuery,
  useLazyGetAllFileTypesQuery, // Added lazy version
  useUpdateFileTypesMutation,
  useDeleteFileTypesMutation,
} = fileTypesApi;
