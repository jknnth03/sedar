import { sedarApi } from "..";
import dashboardApi from "../usermanagement/dashboardApi";

const daformApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["daSubmissions", "positionKpis", "employeesDa"],
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

      createDa: build.mutation({
        query: (body) => ({
          url: "form-submissions",
          method: "POST",
          body,
        }),
        invalidatesTags: ["daSubmissions"],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {}
        },
      }),

      updateDa: build.mutation({
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
          { type: "daSubmissions", id },
          "daSubmissions",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {}
        },
      }),

      resubmitDa: build.mutation({
        query: (submissionId) => ({
          url: `form-submissions/${submissionId}/resubmit`,
          method: "POST",
        }),
        invalidatesTags: (result, error, submissionId) => [
          { type: "daSubmissions", id: submissionId },
          "daSubmissions",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {}
        },
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

      getAllEmployeesDa: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            status,
            approval_status,
            search,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());

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
            ? `employees/da?${queryString}`
            : "employees/da";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["employeesDa"],
      }),

      exportSubmissions: build.query({
        query: (params = {}) => {
          const {
            form_code = "da",
            start_date,
            end_date,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("form_code", form_code);

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
            ? `reports/submissions/export?${queryString}`
            : "reports/submissions/export";

          return {
            url,
            method: "GET",
            responseHandler: (response) => response.blob(),
          };
        },
      }),
    }),
  });

export const {
  useGetDaSubmissionsQuery,
  useLazyGetDaSubmissionsQuery,
  useGetSingleDaSubmissionQuery,
  useLazyGetSingleDaSubmissionQuery,
  useCreateDaMutation,
  useUpdateDaMutation,
  useResubmitDaMutation,
  useGetPositionKpisQuery,
  useLazyGetPositionKpisQuery,
  useGetAllEmployeesDaQuery,
  useLazyGetAllEmployeesDaQuery,
  useExportSubmissionsQuery,
  useLazyExportSubmissionsQuery,
} = daformApi;

export default daformApi;
