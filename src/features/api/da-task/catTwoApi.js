import { sedarApi } from "..";

const catTwoApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["catTwo"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getCatTwoTasks: build.query({
        query: ({
          pagination = 1,
          page = 1,
          per_page = 10,
          status = "active",
        } = {}) => ({
          url: "da-tasks/cat2",
          method: "GET",
          params: {
            pagination,
            page,
            per_page,
            status,
          },
        }),
        providesTags: ["catTwo"],
      }),

      getCatTwoTaskById: build.query({
        query: (taskId) => ({
          url: `da-tasks/cat2/${taskId}`,
          method: "GET",
        }),
        providesTags: (result, error, taskId) => [
          { type: "catTwo", id: taskId },
        ],
      }),

      getCatTwoScore: build.query({
        query: (taskId) => ({
          url: `da-tasks/cat2/${taskId}/score`,
          method: "GET",
        }),
        providesTags: (result, error, taskId) => [
          { type: "catTwo", id: `${taskId}-score` },
        ],
      }),

      saveCatTwoAsDraft: build.mutation({
        query: ({ taskId, ...data }) => ({
          url: `da-tasks/cat2/${taskId}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (result, error, { taskId }) => [
          { type: "catTwo", id: taskId },
          "catTwo",
        ],
      }),

      submitCatTwo: build.mutation({
        query: ({ taskId, ...data }) => ({
          url: `da-tasks/cat2/${taskId}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (result, error, { taskId }) => [
          { type: "catTwo", id: taskId },
          "catTwo",
        ],
      }),
    }),
  });

export const {
  useGetCatTwoTasksQuery,
  useGetCatTwoTaskByIdQuery,
  useGetCatTwoScoreQuery,
  useSaveCatTwoAsDraftMutation,
  useSubmitCatTwoMutation,
} = catTwoApi;

export default catTwoApi;
