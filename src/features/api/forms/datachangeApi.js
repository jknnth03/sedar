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

      // ADD THIS NEW ENDPOINT
      getDataChangeSubmissionDetails: build.query({
        query: (id) => ({
          url: `me/data-change-submissions/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [
          { type: "dataChangeSubmissions", id },
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

      createDataChangeSubmission: build.mutation({
        query: (body) => ({
          url: "form-submissions",
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
  useGetDataChangeSubmissionDetailsQuery, // ADD THIS
  useLazyGetDataChangeSubmissionDetailsQuery, // ADD THIS
  useLazyGetAllDataChangeOptionsQuery,
  useCreateDataChangeSubmissionMutation,
} = dataChangeApi;

export default dataChangeApi;
