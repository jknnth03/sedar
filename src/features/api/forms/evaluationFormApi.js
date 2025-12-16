import { sedarApi } from "..";

const evaluationFormApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: [
      "probationaryEvaluations",
      "positionKpis",
      "employeesProbationary",
    ],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getProbationaryEvaluations: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status,
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
            ? `me/probationary-evaluations?${queryString}`
            : "me/probationary-evaluations";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["probationaryEvaluations"],
      }),

      getSingleProbationaryEvaluation: build.query({
        query: (evaluationId) => ({
          url: `me/probationary-evaluations/${evaluationId}`,
          method: "GET",
        }),
        providesTags: (result, error, evaluationId) => [
          { type: "probationaryEvaluations", id: evaluationId },
          "probationaryEvaluations",
        ],
      }),

      createProbationaryEvaluation: build.mutation({
        query: (body) => ({
          url: "form-submissions",
          method: "POST",
          body,
        }),
        invalidatesTags: ["probationaryEvaluations"],
      }),

      updateProbationaryEvaluation: build.mutation({
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
          { type: "probationaryEvaluations", id },
          "probationaryEvaluations",
        ],
      }),

      getPositionKpis: build.query({
        query: (positionId) => ({
          url: `positions/${positionId}/kpis`,
          method: "GET",
        }),
        providesTags: (result, error, positionId) => [
          { type: "positionKpis", id: positionId },
          "positionKpis",
        ],
      }),

      getEmployeesProbationary: build.query({
        query: (params = {}) => {
          const queryParams = new URLSearchParams();

          if (params) {
            Object.entries(params).forEach(([key, value]) => {
              if (value !== undefined && value !== null && value !== "") {
                queryParams.append(key, value.toString());
              }
            });
          }

          const queryString = queryParams.toString();
          const url = queryString
            ? `employees/probationary?${queryString}`
            : "employees/probationary";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["employeesProbationary"],
      }),

      resubmitProbationaryEvaluation: build.mutation({
        query: (submissionId) => ({
          url: `form-submissions/${submissionId}/resubmit`,
          method: "POST",
        }),
        invalidatesTags: (result, error, submissionId) => [
          { type: "probationaryEvaluations", id: submissionId },
          "probationaryEvaluations",
        ],
      }),

      cancelProbationaryEvaluation: build.mutation({
        query: (submissionId) => ({
          url: `form-submissions/${submissionId}/cancel`,
          method: "POST",
        }),
        invalidatesTags: (result, error, submissionId) => [
          { type: "probationaryEvaluations", id: submissionId },
          "probationaryEvaluations",
        ],
      }),
    }),
  });

export const {
  useGetProbationaryEvaluationsQuery,
  useLazyGetProbationaryEvaluationsQuery,
  useGetSingleProbationaryEvaluationQuery,
  useLazyGetSingleProbationaryEvaluationQuery,
  useCreateProbationaryEvaluationMutation,
  useUpdateProbationaryEvaluationMutation,
  useGetPositionKpisQuery,
  useLazyGetPositionKpisQuery,
  useGetEmployeesProbationaryQuery,
  useLazyGetEmployeesProbationaryQuery,
  useResubmitProbationaryEvaluationMutation,
  useCancelProbationaryEvaluationMutation,
} = evaluationFormApi;

export default evaluationFormApi;
