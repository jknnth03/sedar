import { sedarApi } from "..";

const workhoursApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["work-hours"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postWorkHours: build.mutation({
        query: (body) => ({
          url: "work-hours",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["work-hours"],
      }),

      getShowWorkHours: build.query({
        query: (params) => ({
          url: `work-hours?pagination=${params.pagination}&page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["work-hours"],
      }),

      getAllShowWorkHours: build.query({
        query: () => ({
          url: "work-hours?pagination=none&status=active",
        }),
        providesTags: ["work-hours"],
      }),

      updateWorkHours: build.mutation({
        query: ({ id, ...body }) => ({
          url: `work-hours/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["work-hours"],
      }),

      deleteWorkHours: build.mutation({
        query: (id) => ({
          url: `work-hours/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["work-hours"],
      }),
    }),
  });

export const {
  usePostWorkHoursMutation,
  useGetShowWorkHoursQuery,
  useLazyGetShowWorkHoursQuery,
  useGetAllShowWorkHoursQuery,
  useLazyGetAllShowWorkHoursQuery,
  useUpdateWorkHoursMutation,
  useDeleteWorkHoursMutation,
} = workhoursApi;
