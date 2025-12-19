import { sedarApi } from "..";

const evaluationRecommendationApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["evaluationSubmissions"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getEvaluationSubmissions: build.query({
        query: (params = {}) => {
          const {
            pagination = 1,
            page = 1,
            per_page = 10,
            status = "active",
            search = "",
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());
          queryParams.append("status", status);
          queryParams.append("search", search);

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });

          return {
            url: `me/probationary-evaluations?${queryParams.toString()}`,
            method: "GET",
          };
        },
        providesTags: ["evaluationSubmissions"],
      }),

      getSingleEvaluationSubmission: build.query({
        query: (submissionId) => ({
          url: `me/probationary-evaluations/${submissionId}`,
          method: "GET",
        }),
        providesTags: (result, error, submissionId) => [
          { type: "evaluationSubmissions", id: submissionId },
          "evaluationSubmissions",
        ],
      }),

      submitEvaluationRecommendation: build.mutation({
        query: ({ id, body }) => ({
          url: `me/probationary-evaluations/${id}/recommend`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "evaluationSubmissions", id },
          "evaluationSubmissions",
        ],
      }),

      resubmitEvaluationSubmission: build.mutation({
        query: (id) => ({
          url: `form-submissions/${id}/resubmit`,
          method: "POST",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "evaluationSubmissions", id },
          "evaluationSubmissions",
        ],
      }),

      cancelEvaluationSubmission: build.mutation({
        query: (id) => ({
          url: `form-submissions/${id}/cancel`,
          method: "POST",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "evaluationSubmissions", id },
          "evaluationSubmissions",
        ],
      }),
    }),
  });

export const {
  useGetEvaluationSubmissionsQuery,
  useLazyGetEvaluationSubmissionsQuery,
  useGetSingleEvaluationSubmissionQuery,
  useLazyGetSingleEvaluationSubmissionQuery,
  useSubmitEvaluationRecommendationMutation,
  useResubmitEvaluationSubmissionMutation,
  useCancelEvaluationSubmissionMutation,
} = evaluationRecommendationApi;

export default evaluationRecommendationApi;
