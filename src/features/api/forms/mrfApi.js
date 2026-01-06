import { sedarApi } from "..";

const mrfApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["mrfSubmissions", "mrfPositions", "mrfEmployees"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getMrfSubmissions: build.query({
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
            ? `me/mrf-submissions?${queryString}`
            : "me/mrf-submissions";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["mrfSubmissions"],
      }),

      getAllMrfSubmissions: build.query({
        query: (params = {}) => {
          const { search, status, approval_status, ...otherParams } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", "false");

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
            ? `mrf/open?${queryString}`
            : "mrf/open?pagination=false";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["mrfSubmissions"],
      }),

      getSingleMrfSubmission: build.query({
        query: (mrfSubmissionId) => ({
          url: `me/mrf-submissions/${mrfSubmissionId}`,
          method: "GET",
        }),
        providesTags: (result, error, mrfSubmissionId) => [
          { type: "mrfSubmissions", id: mrfSubmissionId },
          "mrfSubmissions",
        ],
      }),

      getMrfSubmissionAttachment: build.query({
        query: (formSubmissionId) => ({
          url: `form-submissions/${formSubmissionId}/mrf-attachment`,
          method: "GET",
          responseHandler: (response) => response.blob(),
        }),
        providesTags: (result, error, formSubmissionId) => [
          { type: "mrfSubmissions", id: formSubmissionId },
          "mrfSubmissions",
        ],
      }),

      getMrfPositions: build.query({
        query: (params = {}) => {
          const { pagination = "none", ...otherParams } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination);

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });

          const queryString = queryParams.toString();
          const url = queryString
            ? `positions/manpower-options?${queryString}`
            : "positions/manpower-options";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["mrfPositions"],
      }),

      getMrfEmployeeReplacement: build.query({
        query: (params = {}) => {
          const { position_id, requisition_type_id, ...otherParams } = params;

          const queryParams = new URLSearchParams();

          if (position_id) {
            queryParams.append("position_id", position_id.toString());
          }

          if (requisition_type_id) {
            queryParams.append(
              "requisition_type_id",
              requisition_type_id.toString()
            );
          }

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });

          const queryString = queryParams.toString();
          const url = queryString
            ? `employees/replacement-options?${queryString}`
            : "employees/replacement-options";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["mrfEmployees"],
      }),

      createMrfSubmission: build.mutation({
        query: (body) => ({
          url: "form-submissions",
          method: "POST",
          body,
        }),
        invalidatesTags: ["mrfSubmissions"],
      }),

      createMrfEmployeeMovement: build.mutation({
        query: (body) => ({
          url: "form-submissions",
          method: "POST",
          body,
        }),
        invalidatesTags: ["mrfSubmissions"],
      }),

      updateMrfSubmission: build.mutation({
        query: ({ id, body, data }) => {
          if (body && body instanceof FormData) {
            return {
              url: `form-submissions/${id}`,
              method: "POST",
              body: body,
            };
          }

          const formData = new FormData();

          const payloadData = data || body || {};

          if (payloadData && typeof payloadData === "object") {
            Object.keys(payloadData).forEach((key) => {
              if (payloadData[key] !== undefined && payloadData[key] !== null) {
                if (Array.isArray(payloadData[key])) {
                  payloadData[key].forEach((item, index) => {
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
                  typeof payloadData[key] === "object" &&
                  !(payloadData[key] instanceof File)
                ) {
                  formData.append(key, JSON.stringify(payloadData[key]));
                } else {
                  formData.append(key, payloadData[key]);
                }
              }
            });

            formData.append("_method", "PATCH");
          }

          return {
            url: `form-submissions/${id}`,
            method: "POST",
            body: formData,
          };
        },
        invalidatesTags: (result, error, { id }) => [
          { type: "mrfSubmissions", id },
          "mrfSubmissions",
        ],
      }),

      resubmitMrfSubmission: build.mutation({
        query: (payload) => {
          const { id, ...restData } = payload;

          const formData = new FormData();

          Object.keys(restData).forEach((key) => {
            if (restData[key] !== undefined && restData[key] !== null) {
              if (Array.isArray(restData[key])) {
                restData[key].forEach((item, index) => {
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
                typeof restData[key] === "object" &&
                !(restData[key] instanceof File)
              ) {
                formData.append(key, JSON.stringify(restData[key]));
              } else {
                formData.append(key, restData[key]);
              }
            }
          });

          return {
            url: `form-submissions/${id}/resubmit`,
            method: "POST",
            body: formData,
          };
        },
        invalidatesTags: ["mrfSubmissions"],
      }),

      cancelMrfSubmission: build.mutation({
        query: (submissionId) => ({
          url: `form-submissions/${submissionId}/cancel`,
          method: "POST",
        }),
        invalidatesTags: (result, error, submissionId) => [
          { type: "mrfSubmissions", id: submissionId },
          "mrfSubmissions",
        ],
      }),
    }),
  });

export const {
  useGetMrfSubmissionsQuery,
  useLazyGetMrfSubmissionsQuery,
  useGetAllMrfSubmissionsQuery,
  useLazyGetAllMrfSubmissionsQuery,
  useGetSingleMrfSubmissionQuery,
  useLazyGetSingleMrfSubmissionQuery,
  useGetMrfSubmissionAttachmentQuery,
  useLazyGetMrfSubmissionAttachmentQuery,
  useGetMrfPositionsQuery,
  useLazyGetMrfPositionsQuery,
  useGetMrfEmployeeReplacementQuery,
  useLazyGetMrfEmployeeReplacementQuery,
  useCreateMrfSubmissionMutation,
  useCreateMrfEmployeeMovementMutation,
  useUpdateMrfSubmissionMutation,
  useResubmitMrfSubmissionMutation,
  useCancelMrfSubmissionMutation,
} = mrfApi;

export default mrfApi;
