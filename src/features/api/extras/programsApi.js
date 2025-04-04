import { sedarApi } from "..";

const programsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["programs"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postPrograms: build.mutation({
        query: (body) => ({
          url: "programs",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["programs"],
      }),

      getShowPrograms: build.query({
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

          return { url: `programs?${queryParams.toString()}` };
        },
        providesTags: ["programs"],
      }),

      updatePrograms: build.mutation({
        query: ({ id, ...body }) => ({
          url: `programs/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["programs"],
      }),

      deletePrograms: build.mutation({
        query: (id) => ({
          url: `programs/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["programs"],
      }),
    }),
  });

export const {
  usePostProgramsMutation,
  useGetShowProgramsQuery,
  useUpdateProgramsMutation,
  useDeleteProgramsMutation,
} = programsApi;
