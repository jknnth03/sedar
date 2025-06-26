import { sedarApi } from "..";

const schedulesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["schedules"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postSchedules: build.mutation({
        query: (body) => ({
          url: "schedules",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["schedules"],
      }),

      getShowSchedules: build.query({
        query: (params) => ({
          url: `schedules?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["schedules"],
      }),

      getAllShowSchedules: build.query({
        query: () => ({
          url: "schedules?pagination=none&status=active",
        }),
        providesTags: ["schedules"],
      }),

      updateSchedules: build.mutation({
        query: ({ id, ...body }) => ({
          url: `schedules/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["schedules"],
      }),

      deleteSchedules: build.mutation({
        query: (id) => ({
          url: `schedules/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["schedules"],
      }),
    }),
  });

export const {
  usePostSchedulesMutation,
  useGetShowSchedulesQuery,
  useLazyGetShowSchedulesQuery,
  useGetAllShowSchedulesQuery,
  useLazyGetAllShowSchedulesQuery,
  useUpdateSchedulesMutation,
  useDeleteSchedulesMutation,
} = schedulesApi;
