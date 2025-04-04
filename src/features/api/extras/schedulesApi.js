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

          return { url: `schedules?${queryParams.toString()}` };
        },
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
  useUpdateSchedulesMutation,
  useDeleteSchedulesMutation,
} = schedulesApi;
