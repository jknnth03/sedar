import { sedarApi } from "..";

const positionsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["positions"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postPosition: build.mutation({
        query: (formDataToSend) => ({
          url: `positions`,
          method: "POST",
          body: formDataToSend,
          formData: true,
        }),
        invalidatesTags: ["positions"],
      }),

      getPositions: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => ({
          url: `positions?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
        providesTags: ["positions"],
      }),

      getAllPositions: build.query({
        query: () => ({
          url: `positions?pagination=none&status=active`,
        }),
        providesTags: ["positions"],
      }),

      getManpowerOptions: build.query({
        query: () => ({
          url: `positions/manpower-options?pagination=none&status=active`,
        }),
        providesTags: ["positions"],
      }),

      getPositionById: build.query({
        query: (id) => ({
          url: `positions/${id}`,
        }),
        providesTags: ["positions"],
      }),

      updatePosition: build.mutation({
        query: ({ formData, id }) => ({
          url: `positions/${id}`,
          method: "POST",
          body: formData,
          formData: true,
        }),
        invalidatesTags: ["positions"],
      }),

      deletePosition: build.mutation({
        query: (id) => ({
          url: `positions/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["positions"],
      }),
    }),
  });

export const {
  usePostPositionMutation,
  useGetPositionsQuery,
  useLazyGetPositionsQuery,
  useGetAllPositionsQuery,
  useLazyGetAllPositionsQuery,
  useGetManpowerOptionsQuery,
  useLazyGetManpowerOptionsQuery,
  useGetPositionByIdQuery,
  useLazyGetPositionByIdQuery,
  useUpdatePositionMutation,
  useDeletePositionMutation,
} = positionsApi;
