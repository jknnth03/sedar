import { sedarApi } from "..";

const dataChangeApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["dataChangeSubmissions", "dataChangeOptions"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getDataChangeSubmissions: build.query({
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
            ? `me/data-change-submissions?${queryString}`
            : "me/data-change-submissions";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["dataChangeSubmissions"],
      }),

      getDataChangeSubmissionDetails: build.query({
        query: (id) => ({
          url: `me/data-change-submissions/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [
          { type: "dataChangeSubmissions", id },
        ],
      }),

      getDataChangeAttachment: build.query({
        query: ({ submissionId, attachmentId }) => {
          let url = `data-change-submissions/${submissionId}/attachments/${attachmentId}`;

          return {
            url,
            method: "GET",
            responseHandler: (response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.blob();
            },
            cache: "no-cache",
          };
        },
        providesTags: (result, error, { submissionId, attachmentId }) => [
          { type: "dataChangeSubmissions", id: submissionId },
          { type: "attachment", id: `${submissionId}-${attachmentId}` },
        ],
      }),

      getAllDataChangeOptions: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status = "active",
            search,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());
          queryParams.append("status", status);

          if (search && search.trim() !== "") {
            queryParams.append("search", search.trim());
          }

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });

          const queryString = queryParams.toString();
          const url = `employees/data-change-options?${queryString}`;

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["dataChangeOptions"],
      }),

      getAllDataChangeEmployee: build.query({
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
          const url = `employees/data-change?${queryString}`;

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["dataChangeSubmissions"],
      }),

      createDataChangeSubmission: build.mutation({
        query: (body) => ({
          url: "form-submissions",
          method: "POST",
          body,
        }),
        invalidatesTags: ["dataChangeSubmissions"],
      }),

      updateDataChangeSubmission: build.mutation({
        query: ({ id, data }) => {
          let body = data;

          if (body instanceof FormData) {
            body.append("_method", "PATCH");
          } else {
            const formData = new FormData();
            formData.append("_method", "PATCH");
            Object.keys(body).forEach((key) => {
              formData.append(key, body[key]);
            });
            body = formData;
          }

          return {
            url: `form-submissions/${id}`,
            method: "POST",
            body,
          };
        },
        invalidatesTags: ["dataChangeSubmissions"],
      }),

      resubmitDataChangeSubmission: build.mutation({
        query: (body) => ({
          url: "form-submissions/resubmit",
          method: "POST",
          body,
        }),
        invalidatesTags: ["dataChangeSubmissions"],
      }),
    }),
  });

export const {
  useGetDataChangeSubmissionsQuery,
  useLazyGetDataChangeSubmissionsQuery,
  useGetDataChangeSubmissionDetailsQuery,
  useLazyGetDataChangeSubmissionDetailsQuery,
  useGetDataChangeAttachmentQuery,
  useLazyGetDataChangeAttachmentQuery,
  useLazyGetAllDataChangeOptionsQuery,
  useGetAllDataChangeEmployeeQuery,
  useLazyGetAllDataChangeEmployeeQuery,
  useCreateDataChangeSubmissionMutation,
  useUpdateDataChangeSubmissionMutation,
  useResubmitDataChangeSubmissionMutation,
} = dataChangeApi;

export default dataChangeApi;
