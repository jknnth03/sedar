import { sedarApi } from "..";

const catOneApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["catOne"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getCatOneTask: build.query({
        query: () => ({
          url: "da-tasks/cat1/1",
          method: "GET",
        }),
        providesTags: ["catOne"],
      }),

      getCatOneTemplate: build.query({
        query: (templateId) => ({
          url: `da-tasks/cat1/templates/${templateId}`,
          method: "GET",
        }),
        providesTags: ["catOne"],
      }),

      getCatOneScore: build.query({
        query: (submissionId) => ({
          url: `da-tasks/cat1/${submissionId}/score`,
          method: "GET",
        }),
        providesTags: ["catOne"],
      }),

      saveCatOneAsDraft: build.mutation({
        query: (data) => ({
          url: "da-tasks/cat1/1",
          method: "PUT",
          body: data,
        }),
        invalidatesTags: ["catOne"],
      }),

      submitCatOne: build.mutation({
        query: (data) => ({
          url: "da-tasks/cat1/1",
          method: "PUT",
          body: data,
        }),
        invalidatesTags: ["catOne"],
      }),
    }),
  });

export const {
  useGetCatOneTaskQuery,
  useGetCatOneTemplateQuery,
  useGetCatOneScoreQuery,
  useSaveCatOneAsDraftMutation,
  useSubmitCatOneMutation,
} = catOneApi;

export default catOneApi;
