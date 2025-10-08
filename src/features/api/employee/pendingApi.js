import { sedarApi } from "..";

const pendingApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["pending"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getPendingEmployees: build.query({
        query: (params) => {
          if (typeof params === "number" || typeof params === "string") {
            return {
              url: `form-submissions/${params}`,
              method: "GET",
            };
          }

          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status = "active",
            approval_status,
            search,
            date_from,
            date_to,
            ...otherParams
          } = params || {};

          const queryParams = new URLSearchParams();

          if (pagination !== undefined)
            queryParams.append("pagination", pagination);
          if (page) queryParams.append("page", page);
          if (per_page) queryParams.append("per_page", per_page);
          if (status) queryParams.append("status", status);

          if (approval_status)
            queryParams.append("approval_status", approval_status);
          if (search) queryParams.append("search", search);
          if (date_from) queryParams.append("date_from", date_from);
          if (date_to) queryParams.append("date_to", date_to);

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value);
            }
          });

          const queryString = queryParams.toString();
          const url = queryString
            ? `me/employee-registrations?${queryString}`
            : "me/employee-registrations";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["pending"],
      }),

      getMrfSubmissions: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status = "active",
            approval_status,
            search,
            date_from,
            date_to,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          if (pagination !== undefined)
            queryParams.append("pagination", pagination);
          if (page) queryParams.append("page", page);
          if (per_page) queryParams.append("per_page", per_page);
          if (status) queryParams.append("status", status);

          if (approval_status)
            queryParams.append("approval_status", approval_status);
          if (search) queryParams.append("search", search);
          if (date_from) queryParams.append("date_from", date_from);
          if (date_to) queryParams.append("date_to", date_to);

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value);
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
        providesTags: ["pending"],
      }),

      getFormSubmission: build.query({
        query: (id) => ({
          url: `form-submissions/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [{ type: "pending", id }],
      }),

      updateFormSubmission: build.mutation({
        query: ({ id, body }) => ({
          url: `form-submissions/${id}`,
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["pending"],
      }),
    }),
  });

export const {
  useGetPendingEmployeesQuery,
  useLazyGetPendingEmployeesQuery,
  useGetMrfSubmissionsQuery,
  useLazyGetMrfSubmissionsQuery,
  useGetFormSubmissionQuery,
  useLazyGetFormSubmissionQuery,
  useUpdateFormSubmissionMutation,
} = pendingApi;

export default pendingApi;
