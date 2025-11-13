import { sedarApi } from "..";

const workweeksApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["work-weeks"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postWorkWeeks: build.mutation({
        query: (body) => ({
          url: "work-weeks",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["work-weeks"],
      }),

      getShowWorkWeeks: build.query({
        query: (params) => ({
          url: `work-weeks?pagination=${params.pagination}&page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["work-weeks"],
      }),

      getAllShowWorkWeeks: build.query({
        query: () => ({
          url: "work-weeks?pagination=none&status=active",
        }),
        providesTags: ["work-weeks"],
      }),

      updateWorkWeeks: build.mutation({
        query: ({ id, ...body }) => ({
          url: `work-weeks/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["work-weeks"],
      }),

      deleteWorkWeeks: build.mutation({
        query: (id) => ({
          url: `work-weeks/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["work-weeks"],
      }),
    }),
  });

export const {
  usePostWorkWeeksMutation,
  useGetShowWorkWeeksQuery,
  useLazyGetShowWorkWeeksQuery,
  useGetAllShowWorkWeeksQuery,
  useLazyGetAllShowWorkWeeksQuery,
  useUpdateWorkWeeksMutation,
  useDeleteWorkWeeksMutation,
} = workweeksApi;
