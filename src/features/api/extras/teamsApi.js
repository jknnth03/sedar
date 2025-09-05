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
        query: (params) => ({
          url: `teams?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["teams"],
      }),

      getAllShowTeams: build.query({
        query: () => ({
          url: `teams?pagination=none&status=active`,
        }),
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
  useGetAllShowTeamsQuery,
  useUpdateTeamsMutation,
  useDeleteTeamsMutation,
} = teamsApi;
