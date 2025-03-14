import { sedarApi } from ".";

const titlesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["titles", "showTitles"] })
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
          url: "titles",
        }),
        providesTags: ["showTitles"],
      }),
    }),
  });

export const { usePostTitlesMutation, useGetShowTitlesQuery } = titlesApi;
