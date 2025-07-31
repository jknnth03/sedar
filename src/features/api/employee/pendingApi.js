import { sedarApi } from "..";

const pendingApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["pending"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getPendingEmployees: build.query({
        query: (params = {}) => {
          const {
            pagination = 1,
            page = 1,
            per_page = 10,
            status = "active",
            search,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          if (pagination) queryParams.append("pagination", pagination);
          if (page) queryParams.append("page", page);
          if (per_page) queryParams.append("per_page", per_page);
          if (status) queryParams.append("status", status);
          if (search) queryParams.append("search", search);

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
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
  useUpdateFormSubmissionMutation,
} = pendingApi;

export default pendingApi;
