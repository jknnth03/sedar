import { sedarApi } from "..";

const jobratesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["jobrates"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postJobrate: build.mutation({
        query: (body) => ({
          url: "job-rates",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["jobrates"],
      }),

      getJobrates: build.query({
        query: (params) => ({
          url: `job-rates?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["jobrates"],
      }),

      getAllJobRates: build.query({
        query: () => ({
          url: "job-rates", // Adjust if your API uses a different endpoint
        }),
        providesTags: ["jobrates"],
      }),

      updateJobrate: build.mutation({
        query: ({ id, ...body }) => ({
          url: `job-rates/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: ["jobrates"],
      }),

      deleteJobrate: build.mutation({
        query: (id) => ({
          url: `job-rates/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["jobrates"],
      }),
    }),
  });

export const {
  usePostJobrateMutation,
  useGetJobratesQuery,
  useGetAllJobRatesQuery,
  useUpdateJobrateMutation,
  useDeleteJobrateMutation,
} = jobratesApi;
