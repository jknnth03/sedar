import { sedarApi } from "..";

const catTwoApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["catTwo"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getCatTwoTask: build.query({
        query: () => ({
          url: "da-tasks/cat/2",
          method: "GET",
        }),
        providesTags: ["catTwo"],
      }),

      getCatTwoScore: build.query({
        query: () => ({
          url: "da-tasks/cat/2/score",
          method: "GET",
        }),
        providesTags: ["catTwo"],
      }),

      saveCatTwoAsDraft: build.mutation({
        query: (data) => ({
          url: "da-tasks/cat/2",
          method: "PUT",
          body: data,
        }),
        invalidatesTags: ["catTwo"],
      }),

      submitCatTwo: build.mutation({
        query: (data) => ({
          url: "da-tasks/cat/2",
          method: "PUT",
          body: data,
        }),
        invalidatesTags: ["catTwo"],
      }),
    }),
  });

export const {
  useGetCatTwoTaskQuery,
  useGetCatTwoScoreQuery,
  useSaveCatTwoAsDraftMutation,
  useSubmitCatTwoMutation,
} = catTwoApi;

export default catTwoApi;
