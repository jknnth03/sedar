import { sedarApi } from "..";

const mdaRecommendationApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: [
      "mdaRecommendationPrefill",
      "mdaRecommendationSubmissions",
      "recommendationSubmissions",
      "dataChangeNotices",
    ],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getMdaRecommendationPrefill: build.query({
        query: (id) => ({
          url: `mda/prefill-da/${id}`,
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
          { type: "mdaRecommendationPrefill", id },
          "mdaRecommendationPrefill",
        ],
      }),

      createMdaRecommendation: build.mutation({
        query: (body) => ({
          url: "form-submissions",
          method: "POST",
          body,
        }),
        invalidatesTags: [
          "mdaRecommendationSubmissions",
          "recommendationSubmissions",
        ],
      }),

      updateMdaRecommendation: build.mutation({
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
          { type: "mdaRecommendationSubmissions", id },
          "mdaRecommendationSubmissions",
        ],
      }),

      resubmitFormSubmission: build.mutation({
        query: (id) => ({
          url: `form-submissions/${id}/resubmit`,
          method: "POST",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "mdaRecommendationSubmissions", id },
          { type: "recommendationSubmissions", id },
          "mdaRecommendationSubmissions",
          "recommendationSubmissions",
        ],
      }),

      cancelFormSubmission: build.mutation({
        query: (id) => ({
          url: `form-submissions/${id}/cancel`,
          method: "POST",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "mdaRecommendationSubmissions", id },
          { type: "recommendationSubmissions", id },
          "mdaRecommendationSubmissions",
          "recommendationSubmissions",
        ],
      }),

      getRecommendationSubmissions: build.query({
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
            ? `me/da-submissions?${queryString}`
            : "me/da-submissions";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["recommendationSubmissions"],
      }),

      getSingleRecommendationSubmission: build.query({
        query: (submissionId) => ({
          url: `me/da-submissions/${submissionId}`,
          method: "GET",
        }),
        providesTags: (result, error, submissionId) => [
          { type: "recommendationSubmissions", id: submissionId },
          "recommendationSubmissions",
        ],
      }),

      getMdaRecommendationSubmissions: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status,
            approval_status,
            search,
            type,
            da_stage,
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

          if (type) {
            queryParams.append("type", type);
          }

          if (da_stage) {
            queryParams.append("da_stage", da_stage);
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
        providesTags: ["mdaRecommendationSubmissions"],
      }),

      getSingleMdaRecommendationSubmission: build.query({
        query: (submissionId) => ({
          url: `me/mda-submissions/${submissionId}`,
          method: "GET",
        }),
        providesTags: (result, error, submissionId) => [
          { type: "mdaRecommendationSubmissions", id: submissionId },
          "mdaRecommendationSubmissions",
        ],
      }),

      getDataChangeNotice: build.query({
        query: (noticeId) => ({
          url: `data-change-notices/${noticeId}`,
          method: "GET",
        }),
        providesTags: (result, error, noticeId) => [
          { type: "dataChangeNotices", id: noticeId },
          "dataChangeNotices",
        ],
      }),
    }),
  });

export const {
  useGetMdaRecommendationPrefillQuery,
  useLazyGetMdaRecommendationPrefillQuery,
  useCreateMdaRecommendationMutation,
  useUpdateMdaRecommendationMutation,
  useResubmitFormSubmissionMutation,
  useCancelFormSubmissionMutation,
  useGetRecommendationSubmissionsQuery,
  useLazyGetRecommendationSubmissionsQuery,
  useGetSingleRecommendationSubmissionQuery,
  useLazyGetSingleRecommendationSubmissionQuery,
  useGetMdaRecommendationSubmissionsQuery,
  useLazyGetMdaRecommendationSubmissionsQuery,
  useGetSingleMdaRecommendationSubmissionQuery,
  useLazyGetSingleMdaRecommendationSubmissionQuery,
  useGetDataChangeNoticeQuery,
  useLazyGetDataChangeNoticeQuery,
} = mdaRecommendationApi;

export default mdaRecommendationApi;
