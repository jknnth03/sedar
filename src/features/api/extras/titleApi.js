import { sedarApi } from "..";

const titlesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["titles"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postTitles: build.mutation({
        query: (body) => ({
          url: "titles",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["titles"],
      }),

      getShowTitles: build.query({
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

          return { url: `titles?${queryParams.toString()}` };
        },
        providesTags: ["titles"],
      }),

      updateTitles: build.mutation({
        query: ({ id, ...body }) => ({
          url: `titles/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["titles"],
      }),

      deleteTitle: build.mutation({
        query: (id) => ({
          url: `titles/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["titles"],
      }),
    }),
  });

export const {
  usePostTitlesMutation,
  useGetShowTitlesQuery,
  useUpdateTitlesMutation,
  useDeleteTitleMutation,
} = titlesApi;
