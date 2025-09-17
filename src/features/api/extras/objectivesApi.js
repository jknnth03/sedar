import { sedarApi } from "..";

const objectivesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["objectives"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postObjective: build.mutation({
        query: (body) => ({
          url: "objectives",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["objectives"],
      }),

      getShowObjectives: build.query({
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

          return { url: `objectives?${queryParams.toString()}` };
        },
        providesTags: ["objectives"],
      }),

      getAllShowObjectives: build.query({
        query: ({ status, search = "" } = {}) => {
          const queryParams = new URLSearchParams();

          queryParams.append("pagination", "false");

          if (status) queryParams.append("status", status);
          if (search) queryParams.append("search", search);

          return { url: `objectives?${queryParams.toString()}` };
        },
        providesTags: ["objectives"],
      }),

      updateObjective: build.mutation({
        query: ({ id, ...body }) => ({
          url: `objectives/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["objectives"],
      }),

      deleteObjective: build.mutation({
        query: (id) => ({
          url: `objectives/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["objectives"],
      }),
    }),
  });

export const {
  usePostObjectiveMutation,
  useGetShowObjectivesQuery,
  useGetAllShowObjectivesQuery,
  useUpdateObjectiveMutation,
  useDeleteObjectiveMutation,
} = objectivesApi;
