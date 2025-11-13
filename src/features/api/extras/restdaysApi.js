import { sedarApi } from "..";

const restdaysApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["rest-days"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postRestDays: build.mutation({
        query: (body) => ({
          url: "rest-days",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["rest-days"],
      }),

      getShowRestDays: build.query({
        query: (params) => ({
          url: `rest-days?pagination=${params.pagination}&page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["rest-days"],
      }),

      getAllShowRestDays: build.query({
        query: () => ({
          url: "rest-days?pagination=none&status=active",
        }),
        providesTags: ["rest-days"],
      }),

      updateRestDays: build.mutation({
        query: ({ id, ...body }) => ({
          url: `rest-days/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["rest-days"],
      }),

      deleteRestDays: build.mutation({
        query: (id) => ({
          url: `rest-days/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["rest-days"],
      }),
    }),
  });

export const {
  usePostRestDaysMutation,
  useGetShowRestDaysQuery,
  useLazyGetShowRestDaysQuery,
  useGetAllShowRestDaysQuery,
  useLazyGetAllShowRestDaysQuery,
  useUpdateRestDaysMutation,
  useDeleteRestDaysMutation,
} = restdaysApi;
