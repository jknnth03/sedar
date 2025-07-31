import { sedarApi } from "..";

const jobbandsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["jobbands"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postJobband: build.mutation({
        query: (body) => ({
          url: "job-bands",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["jobbands"],
      }),

      getJobbands: build.query({
        query: (params) => ({
          url: `job-bands?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["jobbands"],
      }),

      getAllJobbands: build.query({
        query: () => ({
          url: `job-bands?pagination=none&status=active`,
        }),
        providesTags: ["jobbands"],
      }),

      updateJobband: build.mutation({
        query: ({ id, ...body }) => ({
          url: `job-bands/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: ["jobbands"],
      }),

      deleteJobband: build.mutation({
        query: (id) => ({
          url: `job-bands/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["jobbands"],
      }),
    }),
  });

export const {
  usePostJobbandMutation,
  useGetJobbandsQuery,
  useGetAllJobbandsQuery,
  useUpdateJobbandMutation,
  useDeleteJobbandMutation,
} = jobbandsApi;
