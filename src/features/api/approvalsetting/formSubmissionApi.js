import { sedarApi } from "..";

const formSubmissionApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["formSubmissions", "approvalForms", "mrfSubmissions"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getFormSubmissions: build.query({
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
            ? `me/form-submissions?${queryString}`
            : "me/form-submissions";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["formSubmissions"],
      }),

      getMrfSubmissions: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status,
            approval_status,
            search,
            start_date,
            end_date,
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

          if (start_date) {
            queryParams.append("start_date", start_date);
          }

          if (end_date) {
            queryParams.append("end_date", end_date);
          }

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });

          const queryString = queryParams.toString();
          const url = queryString
            ? `me/mrf-submissions?${queryString}`
            : "me/mrf-submissions";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["mrfSubmissions"],
      }),

      getMrfSubmissionsCounts: build.query({
        query: () => ({
          url: "me/mrf-submissions/counts",
          method: "GET",
        }),
        providesTags: ["mrfSubmissions"],
      }),

      getSingleFormSubmission: build.query({
        query: (formSubmissionId) => ({
          url: `form-submissions/${formSubmissionId}`,
          method: "GET",
        }),
        providesTags: (result, error, formSubmissionId) => [
          { type: "formSubmissions", id: formSubmissionId },
          "formSubmissions",
        ],
      }),

      getFormSubmissionAttachment: build.query({
        query: (formSubmissionId) => ({
          url: `form-submissions/${formSubmissionId}/mrf-attachment`,
          method: "GET",
          responseHandler: (response) => response.blob(),
        }),
        providesTags: (result, error, formSubmissionId) => [
          { type: "formSubmissions", id: formSubmissionId },
          "formSubmissions",
        ],
      }),

      getAllApprovalForms: build.query({
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
          const url = queryString ? `forms?${queryString}` : "forms";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["approvalForms"],
      }),

      createFormSubmission: build.mutation({
        query: (body) => ({
          url: "form-submissions",
          method: "POST",
          body,
        }),
        invalidatesTags: ["formSubmissions"],
      }),

      updateFormSubmission: build.mutation({
        query: ({ id, data }) => ({
          url: `form-submissions/${id}`,
          method: "POST",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "formSubmissions", id },
          "formSubmissions",
        ],
      }),

      resubmitFormSubmission: build.mutation({
        query: (submissionId) => ({
          url: `form-submissions/${submissionId}/resubmit`,
          method: "POST",
        }),
        invalidatesTags: (result, error, submissionId) => [
          { type: "formSubmissions", id: submissionId },
          "formSubmissions",
        ],
      }),

      cancelFormSubmission: build.mutation({
        query: (submissionId) => ({
          url: `form-submissions/${submissionId}/cancel`,
          method: "POST",
        }),
        invalidatesTags: (result, error, submissionId) => [
          { type: "formSubmissions", id: submissionId },
          "formSubmissions",
        ],
      }),

      deleteFormSubmission: build.mutation({
        query: (submissionId) => ({
          url: `form-submissions/${submissionId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, submissionId) => [
          { type: "formSubmissions", id: submissionId },
          "formSubmissions",
        ],
      }),
    }),
  });

export const {
  useGetFormSubmissionsQuery,
  useGetMrfSubmissionsQuery,
  useLazyGetMrfSubmissionsQuery,
  useGetMrfSubmissionsCountsQuery,
  useLazyGetMrfSubmissionsCountsQuery,
  useGetSingleFormSubmissionQuery,
  useLazyGetSingleFormSubmissionQuery,
  useGetFormSubmissionAttachmentQuery,
  useLazyGetFormSubmissionAttachmentQuery,
  useGetAllApprovalFormsQuery,
  useLazyGetAllApprovalFormsQuery,
  useResubmitFormSubmissionMutation,
  useCreateFormSubmissionMutation,
  useUpdateFormSubmissionMutation,
  useCancelFormSubmissionMutation,
  useDeleteFormSubmissionMutation,
} = formSubmissionApi;

export default formSubmissionApi;
