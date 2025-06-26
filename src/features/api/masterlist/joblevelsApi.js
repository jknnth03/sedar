import { sedarApi } from "..";

const joblevelsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["joblevels"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postJoblevel: build.mutation({
        query: (body) => ({
          url: "job-levels",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["joblevels"],
      }),

      getJoblevels: build.query({
        query: (params) => ({
          url: `job-levels?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["joblevels"],
      }),

      getAllJobLevels: build.query({
        query: () => ({
          url: `job-levels?pagination=none&status=active`,
        }),
        providesTags: ["job-levels"],
      }),

      updateJoblevel: build.mutation({
        query: ({ id, ...body }) => ({
          url: `job-levels/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: ["joblevels"],
      }),

      deleteJoblevel: build.mutation({
        query: (id) => ({
          url: `job-levels/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["joblevels"],
      }),
    }),
  });

export const {
  usePostJoblevelMutation,
  useGetJoblevelsQuery,
  useLazyGetJoblevelsQuery,
  useGetAllJobLevelsQuery,
  useLazyGetAllJobLevelsQuery,
  useUpdateJoblevelMutation,
  useDeleteJoblevelMutation,
} = joblevelsApi;
