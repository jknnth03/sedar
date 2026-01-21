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
        query: (params) => ({
          url: `titles?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["titles"],
      }),

      getAllShowTitles: build.query({
        query: () => ({
          url: `titles?pagination=none&status=active`,
        }),
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

      deleteTitles: build.mutation({
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
  useLazyGetAllShowTitlesQuery,
  useGetAllShowTitlesQuery,
  useUpdateTitlesMutation,
  useDeleteTitlesMutation,
} = titlesApi;
