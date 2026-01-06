import { sedarApi } from "..";

const biAnnualPerformanceApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: [
      "performanceEvaluations",
      "positionKpis",
      "probationaryEmployees",
    ],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getPerformanceEvaluations: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status,
            approval_status,
            search,
            period,
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

          if (period) {
            queryParams.append("period", period);
          }

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });

          const queryString = queryParams.toString();
          const url = queryString
            ? `me/performance-evaluations?${queryString}`
            : "me/performance-evaluations";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["performanceEvaluations"],
      }),

      getSinglePerformanceEvaluation: build.query({
        query: (evaluationId) => ({
          url: `me/performance-evaluations/${evaluationId}`,
          method: "GET",
        }),
        providesTags: (result, error, evaluationId) => [
          { type: "performanceEvaluations", id: evaluationId },
          "performanceEvaluations",
        ],
      }),

      printPerformanceEvaluation: build.query({
        query: (evaluationId) => ({
          url: `me/performance-evaluations/${evaluationId}/print`,
          method: "GET",
        }),
        providesTags: (result, error, evaluationId) => [
          { type: "performanceEvaluations", id: evaluationId },
        ],
      }),

      createPerformanceEvaluation: build.mutation({
        query: (body) => ({
          url: "form-submissions",
          method: "POST",
          body,
        }),
        invalidatesTags: ["performanceEvaluations"],
      }),

      updatePerformanceEvaluation: build.mutation({
        query: ({ id, data }) => {
          return {
            url: `form-submissions/${id}`,
            method: "PATCH",
            body: data,
            headers: {
              "Content-Type": "application/json",
            },
          };
        },
        invalidatesTags: (result, error, { id }) => [
          { type: "performanceEvaluations", id },
          "performanceEvaluations",
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

      getPerformanceEvaluationPrefill: build.query({
        query: (params = {}) => {
          const { employee_id, period } = params;

          const queryParams = new URLSearchParams();

          if (employee_id) {
            queryParams.append("employee_id", employee_id);
          }

          if (period) {
            queryParams.append("period", period);
          }

          const queryString = queryParams.toString();
          const url = queryString
            ? `performance-evaluations/prefill?${queryString}`
            : "performance-evaluations/prefill";

          return {
            url,
            method: "GET",
          };
        },
      }),

      getProbationaryEmployees: build.query({
        query: () => ({
          url: "employees/bi-annual",
          method: "GET",
        }),
        providesTags: ["probationaryEmployees"],
      }),

      resubmitPerformanceEvaluation: build.mutation({
        query: (submissionId) => ({
          url: `form-submissions/${submissionId}/resubmit`,
          method: "POST",
        }),
        invalidatesTags: (result, error, submissionId) => [
          { type: "performanceEvaluations", id: submissionId },
          "performanceEvaluations",
        ],
      }),

      cancelPerformanceEvaluation: build.mutation({
        query: (submissionId) => ({
          url: `form-submissions/${submissionId}/cancel`,
          method: "POST",
        }),
        invalidatesTags: (result, error, submissionId) => [
          { type: "performanceEvaluations", id: submissionId },
          "performanceEvaluations",
        ],
      }),
    }),
  });

export const {
  useGetPerformanceEvaluationsQuery,
  useLazyGetPerformanceEvaluationsQuery,
  useGetSinglePerformanceEvaluationQuery,
  useLazyGetSinglePerformanceEvaluationQuery,
  usePrintPerformanceEvaluationQuery,
  useLazyPrintPerformanceEvaluationQuery,
  useCreatePerformanceEvaluationMutation,
  useUpdatePerformanceEvaluationMutation,
  useGetPositionKpisQuery,
  useLazyGetPositionKpisQuery,
  useGetPerformanceEvaluationPrefillQuery,
  useLazyGetPerformanceEvaluationPrefillQuery,
  useGetProbationaryEmployeesQuery,
  useLazyGetProbationaryEmployeesQuery,
  useResubmitPerformanceEvaluationMutation,
  useCancelPerformanceEvaluationMutation,
} = biAnnualPerformanceApi;

export default biAnnualPerformanceApi;
