import { sedarApi } from "..";

const movementTypesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["movement-types"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postMovementTypes: build.mutation({
        query: (body) => ({
          url: "movement-types",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["movement-types"],
      }),

      getMovementTypes: build.query({
        query: (params) => ({
          url: `movement-types?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["movement-types"],
      }),

      getAllMovementTypes: build.query({
        query: () => ({
          url: `movement-types?pagination=none&status=active`,
        }),
        providesTags: ["movement-types"],
      }),

      updateMovementTypes: build.mutation({
        query: ({ id, ...body }) => ({
          url: `movement-types/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["movement-types"],
      }),

      deleteMovementTypes: build.mutation({
        query: (id) => ({
          url: `movement-types/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["movement-types"],
      }),
    }),
  });

export const {
  usePostMovementTypesMutation,
  useGetMovementTypesQuery,
  useGetAllMovementTypesQuery,
  useUpdateMovementTypesMutation,
  useDeleteMovementTypesMutation,
} = movementTypesApi;
