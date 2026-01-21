import { sedarApi } from "..";

const daRecommendationApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["daSubmissions"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getDaSubmissions: build.query({
        query: (params = {}) => {
          const {
            pagination = 1,
            page = 1,
            per_page = 10,
            status = "active",
            approval_status = "",
            search = "",
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());
          queryParams.append("status", status);
          queryParams.append("approval_status", approval_status);
          queryParams.append("search", search);

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });

          return {
            url: `me/da-submissions?${queryParams.toString()}`,
            method: "GET",
          };
        },
        providesTags: ["daSubmissions"],
      }),

      getSingleDaSubmission: build.query({
        query: (submissionId) => ({
          url: `me/da-submissions/${submissionId}`,
          method: "GET",
        }),
        providesTags: (result, error, submissionId) => [
          { type: "daSubmissions", id: submissionId },
          "daSubmissions",
        ],
      }),

      updateDaSubmission: build.mutation({
        query: ({ id, body }) => ({
          url: `me/da-submissions/${id}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "daSubmissions", id },
          "daSubmissions",
        ],
      }),

      submitDaRecommendation: build.mutation({
        query: ({ id, body }) => ({
          url: `me/da-submissions/${id}/recommend`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "daSubmissions", id },
          "daSubmissions",
        ],
      }),

      resubmitDaSubmission: build.mutation({
        query: (id) => ({
          url: `form-submissions/${id}/resubmit`,
          method: "POST",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "daSubmissions", id },
          "daSubmissions",
        ],
      }),

      cancelDaSubmission: build.mutation({
        query: (id) => ({
          url: `form-submissions/${id}/cancel`,
          method: "POST",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "daSubmissions", id },
          "daSubmissions",
        ],
      }),
    }),
  });

export const {
  useGetDaSubmissionsQuery,
  useLazyGetDaSubmissionsQuery,
  useGetSingleDaSubmissionQuery,
  useLazyGetSingleDaSubmissionQuery,
  useUpdateDaSubmissionMutation,
  useSubmitDaRecommendationMutation,
  useResubmitDaSubmissionMutation,
  useCancelDaSubmissionMutation,
} = daRecommendationApi;

export default daRecommendationApi;
