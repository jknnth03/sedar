import { sedarApi } from "..";

const mdaDaApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: [
      "mdaDaPrefill",
      "mdaDaSubmissions",
      "daSubmissions",
      "dataChangeNotices",
    ],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getMdaDaPrefill: build.query({
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
          { type: "mdaDaPrefill", id },
          "mdaDaPrefill",
        ],
      }),

      createMdaDa: build.mutation({
        query: (body) => ({
          url: "form-submissions",
          method: "POST",
          body,
        }),
        invalidatesTags: ["mdaDaSubmissions", "daSubmissions"],
      }),

      updateMdaDa: build.mutation({
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
          { type: "mdaDaSubmissions", id },
          "mdaDaSubmissions",
        ],
      }),

      getDaSubmissions: build.query({
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

      getMdaDaSubmissions: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status,
            approval_status,
            search,
            type,
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
        providesTags: ["mdaDaSubmissions"],
      }),

      getSingleMdaDaSubmission: build.query({
        query: (submissionId) => ({
          url: `me/mda-submissions/${submissionId}`,
          method: "GET",
        }),
        providesTags: (result, error, submissionId) => [
          { type: "mdaDaSubmissions", id: submissionId },
          "mdaDaSubmissions",
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
  useGetMdaDaPrefillQuery,
  useLazyGetMdaDaPrefillQuery,
  useCreateMdaDaMutation,
  useUpdateMdaDaMutation,
  useGetDaSubmissionsQuery,
  useLazyGetDaSubmissionsQuery,
  useGetSingleDaSubmissionQuery,
  useLazyGetSingleDaSubmissionQuery,
  useGetMdaDaSubmissionsQuery,
  useLazyGetMdaDaSubmissionsQuery,
  useGetSingleMdaDaSubmissionQuery,
  useLazyGetSingleMdaDaSubmissionQuery,
  useGetDataChangeNoticeQuery,
  useLazyGetDataChangeNoticeQuery,
} = mdaDaApi;

export default mdaDaApi;
