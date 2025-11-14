import { sedarApi } from "..";

const separationReasonsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["separation-reasons"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postSeparationReason: build.mutation({
        query: (body) => ({
          url: "separation-reasons",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["separation-reasons"],
      }),

      getShowSeparationReasons: build.query({
        query: (params) => ({
          url: `separation-reasons?pagination=${params.pagination}&page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["separation-reasons"],
      }),

      getAllShowSeparationReasons: build.query({
        query: () => ({
          url: "separation-reasons?pagination=none&status=active",
        }),
        providesTags: ["separation-reasons"],
      }),

      updateSeparationReason: build.mutation({
        query: ({ id, ...body }) => ({
          url: `separation-reasons/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["separation-reasons"],
      }),

      deleteSeparationReason: build.mutation({
        query: (id) => ({
          url: `separation-reasons/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["separation-reasons"],
      }),
    }),
  });

export const {
  usePostSeparationReasonMutation,
  useGetShowSeparationReasonsQuery,
  useLazyGetShowSeparationReasonsQuery,
  useGetAllShowSeparationReasonsQuery,
  useLazyGetAllShowSeparationReasonsQuery,
  useUpdateSeparationReasonMutation,
  useDeleteSeparationReasonMutation,
} = separationReasonsApi;
