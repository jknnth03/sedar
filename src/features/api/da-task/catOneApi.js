import { sedarApi } from "..";

const catOneApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["catOne"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getCatOneTask: build.query({
        query: ({
          pagination = 1,
          page = 1,
          per_page = 10,
          status = "active",
        }) => ({
          url: "da-tasks/cat1",
          method: "GET",
          params: {
            pagination,
            page,
            per_page,
            status,
          },
        }),
        providesTags: ["catOne"],
      }),
      getCatOneById: build.query({
        query: (id) => ({
          url: `da-tasks/cat1/${id}`,
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
  useGetCatOneByIdQuery,
  useGetCatOneTemplateQuery,
  useGetCatOneScoreQuery,
  useSaveCatOneAsDraftMutation,
  useSubmitCatOneMutation,
} = catOneApi;

export default catOneApi;
