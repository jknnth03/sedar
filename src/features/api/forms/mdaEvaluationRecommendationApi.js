import { sedarApi } from "..";

const mdaEvaluationRecommendationApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: [
      "mdaEvaluationPrefill",
      "mdaEvaluationSubmissions",
      "evaluationSubmissions",
      "dataChangeNotices",
    ],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getMdaEvaluationPrefill: build.query({
        query: (id) => ({
          url: `mda/prefill-probationary/${id}`,
          method: "GET",
        }),
        transformResponse: (response) => {
          if (response?.result) {
            const {
              to_position_title,
              to_department,
              to_sub_unit,
              to_job_level,
              ...rest
            } = response.result;
            return {
              ...response,
              result: rest,
            };
          }
          return response;
        },
        providesTags: (result, error, id) => [
          { type: "mdaEvaluationPrefill", id },
          "mdaEvaluationPrefill",
        ],
      }),

      createMdaEvaluation: build.mutation({
        query: (body) => ({
          url: "form-submissions",
          method: "POST",
          body,
        }),
        invalidatesTags: ["mdaEvaluationSubmissions", "evaluationSubmissions"],
      }),

      updateMdaEvaluation: build.mutation({
        query: ({ id, data }) => {
          const formData = new FormData();

          Object.keys(data).forEach((key) => {
            if (data[key] !== undefined && data[key] !== null) {
              if (Array.isArray(data[key])) {
                data[key].forEach((item, index) => {
                  if (typeof item === "object" && item !== null) {
                    Object.keys(item).forEach((itemKey) => {
                      if (
                        item[itemKey] !== undefined &&
                        item[itemKey] !== null
                      ) {
                        formData.append(
                          `${key}[${index}][${itemKey}]`,
                          item[itemKey]
                        );
                      }
                    });
                  } else {
                    formData.append(`${key}[${index}]`, item);
                  }
                });
              } else if (
                typeof data[key] === "object" &&
                !(data[key] instanceof File)
              ) {
                formData.append(key, JSON.stringify(data[key]));
              } else {
                formData.append(key, data[key]);
              }
            }
          });

          formData.append("_method", "PATCH");

          return {
            url: `form-submissions/${id}`,
            method: "POST",
            body: formData,
          };
        },
        invalidatesTags: (result, error, { id }) => [
          { type: "mdaEvaluationSubmissions", id },
          "mdaEvaluationSubmissions",
        ],
      }),

      getEvaluationSubmissions: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status,
            approval_status,
            search,
            view_mode,
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

          if (view_mode) {
            queryParams.append("view_mode", view_mode);
          }

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });

          const queryString = queryParams.toString();
          const url = queryString
            ? `me/probationary-evaluations?${queryString}`
            : "me/probationary-evaluations";

          return {
            url,
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

      getMdaEvaluationSubmissions: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status,
            approval_status,
            search,
            type = "probationary-evaluation",
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());
          queryParams.append("type", type);

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
            ? `me/mda-submissions?${queryString}`
            : "me/mda-submissions";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["mdaEvaluationSubmissions"],
      }),

      getSingleMdaEvaluationSubmission: build.query({
        query: (submissionId) => ({
          url: `me/mda-submissions/${submissionId}`,
          method: "GET",
        }),
        providesTags: (result, error, submissionId) => [
          { type: "mdaEvaluationSubmissions", id: submissionId },
          "mdaEvaluationSubmissions",
        ],
      }),

      getDataChangeNotice: build.query({
        query: (id) => ({
          url: `data-change/${id}/notice`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [
          { type: "dataChangeNotices", id },
          "dataChangeNotices",
        ],
      }),

      resubmitFormSubmission: build.mutation({
        query: (id) => ({
          url: `form-submissions/${id}/resubmit`,
          method: "POST",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "mdaEvaluationSubmissions", id },
          { type: "evaluationSubmissions", id },
          "mdaEvaluationSubmissions",
          "evaluationSubmissions",
        ],
      }),

      cancelFormSubmission: build.mutation({
        query: (id) => ({
          url: `form-submissions/${id}/cancel`,
          method: "POST",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "mdaEvaluationSubmissions", id },
          { type: "evaluationSubmissions", id },
          "mdaEvaluationSubmissions",
          "evaluationSubmissions",
        ],
      }),
    }),
  });

export const {
  useGetMdaEvaluationPrefillQuery,
  useLazyGetMdaEvaluationPrefillQuery,
  useCreateMdaEvaluationMutation,
  useUpdateMdaEvaluationMutation,
  useGetEvaluationSubmissionsQuery,
  useLazyGetEvaluationSubmissionsQuery,
  useGetSingleEvaluationSubmissionQuery,
  useLazyGetSingleEvaluationSubmissionQuery,
  useGetMdaEvaluationSubmissionsQuery,
  useLazyGetMdaEvaluationSubmissionsQuery,
  useGetSingleMdaEvaluationSubmissionQuery,
  useLazyGetSingleMdaEvaluationSubmissionQuery,
  useGetDataChangeNoticeQuery,
  useLazyGetDataChangeNoticeQuery,
  useResubmitFormSubmissionMutation,
  useCancelFormSubmissionMutation,
} = mdaEvaluationRecommendationApi;

export default mdaEvaluationRecommendationApi;
