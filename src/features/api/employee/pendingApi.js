import { sedarApi } from "..";

const pendingApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["pending"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getPendingEmployees: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status = "active",
            approval_status,
            search,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          // Add core parameters
          if (pagination !== undefined)
            queryParams.append("pagination", pagination);
          if (page) queryParams.append("page", page);
          if (per_page) queryParams.append("per_page", per_page);
          if (status) queryParams.append("status", status);

          // Add filter parameters
          if (approval_status)
            queryParams.append("approval_status", approval_status);
          if (search) queryParams.append("search", search);

          // Add any additional parameters
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

      // For MRF submissions (based on your example URL)
      getMrfSubmissions: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status = "active",
            approval_status,
            search,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          // Add core parameters
          if (pagination !== undefined)
            queryParams.append("pagination", pagination);
          if (page) queryParams.append("page", page);
          if (per_page) queryParams.append("per_page", per_page);
          if (status) queryParams.append("status", status);

          // Add filter parameters
          if (approval_status)
            queryParams.append("approval_status", approval_status);
          if (search) queryParams.append("search", search);

          // Add any additional parameters
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

      // Add the missing getFormSubmission query
      getFormSubmission: build.query({
        query: (id) => ({
          url: `form-submissions/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [{ type: "pending", id }],
      }),

      updateFormSubmission: build.mutation({
        query: (body) => ({
          url: `form-submissions/${body?.id}`,
          method: "POST",
          body: body?.data,
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
