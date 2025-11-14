import { sedarApi } from "..";

const separationTypesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["separation-types"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postSeparationType: build.mutation({
        query: (body) => ({
          url: "separation-types",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["separation-types"],
      }),

      getShowSeparationTypes: build.query({
        query: (params) => ({
          url: `separation-types?pagination=${params.pagination}&page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["separation-types"],
      }),

      getAllShowSeparationTypes: build.query({
        query: () => ({
          url: "separation-types?pagination=none&status=active",
        }),
        providesTags: ["separation-types"],
      }),

      updateSeparationType: build.mutation({
        query: ({ id, ...body }) => ({
          url: `separation-types/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["separation-types"],
      }),

      deleteSeparationType: build.mutation({
        query: (id) => ({
          url: `separation-types/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["separation-types"],
      }),
    }),
  });

export const {
  usePostSeparationTypeMutation,
  useGetShowSeparationTypesQuery,
  useLazyGetShowSeparationTypesQuery,
  useGetAllShowSeparationTypesQuery,
  useLazyGetAllShowSeparationTypesQuery,
  useUpdateSeparationTypeMutation,
  useDeleteSeparationTypeMutation,
} = separationTypesApi;
