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
            pagination = true,
            page = 1,
            per_page = 10,
            status,
            approval_status,
            search,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());

          if (status) {
            queryParams.append("status", status);
          }

          if (approval_status) {
            queryParams.append("approval_status", approval_status);
          }

          if (search && search.trim() !== "") {
            queryParams.append("search", search.trim());
          }

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });

          const queryString = queryParams.toString();
          const url = queryString
            ? `me/da-submissions?${queryString}`
            : "me/da-submissions";

          return {
            url,
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

      submitDaRecommendation: build.mutation({
        query: (body) => ({
          url: "form-submissions",
          method: "POST",
          body,
        }),
        invalidatesTags: ["daSubmissions"],
      }),

      resubmitDaRecommendation: build.mutation({
        query: (id) => ({
          url: `form-submissions/${id}/resubmit`,
          method: "POST",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "daSubmissions", id },
          "daSubmissions",
        ],
      }),

      cancelDaRecommendation: build.mutation({
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
  useSubmitDaRecommendationMutation,
  useResubmitDaRecommendationMutation,
  useCancelDaRecommendationMutation,
} = daRecommendationApi;

export default daRecommendationApi;
