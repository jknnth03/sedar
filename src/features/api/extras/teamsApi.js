import { sedarApi } from "..";

const teamsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["teams"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postTeams: build.mutation({
        query: (body) => ({
          url: "teams",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["teams"],
      }),

      getShowTeams: build.query({
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

          return { url: `teams?${queryParams.toString()}` };
        },
        providesTags: ["teams"],
      }),

      updateTeams: build.mutation({
        query: ({ id, ...body }) => ({
          url: `teams/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["teams"],
      }),

      deleteTeams: build.mutation({
        query: (id) => ({
          url: `teams/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["teams"],
      }),
    }),
  });

export const {
  usePostTeamsMutation,
  useGetShowTeamsQuery,
  useUpdateTeamsMutation,
  useDeleteTeamsMutation,
} = teamsApi;
