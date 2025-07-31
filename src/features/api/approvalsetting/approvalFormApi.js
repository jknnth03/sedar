import { sedarApi } from "..";

const approvalForm = sedarApi
  .enhanceEndpoints({ addTagTypes: ["approvalForms"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getApprovalForms: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status = "active", // Default status value
            search,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());
          queryParams.append("status", status); // Always include status

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
      // Add the getAllApprovalForms endpoint that your component is looking for
      getAllApprovalForms: build.query({
        query: (params = {}) => {
          const {
            pagination = false, // Default to false for "get all"
            status = "active",
            search,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination.toString());
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
          const url = queryString ? `forms?${queryString}` : "forms";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["approvalForms"],
      }),
      getAllEmployees: build.query({
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
          // ✅ Fixed: Use 'employees' endpoint instead of 'me/form-submissions'
          const url = queryString ? `employees?${queryString}` : "employees";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["employees"],
      }),

      getSingleApprovalForm: build.query({
        query: (approvalFormId) => ({
          url: `forms/${approvalFormId}`,
          method: "GET",
        }),
        providesTags: (result, error, approvalFormId) => [
          { type: "approvalForms", id: approvalFormId },
          "approvalForms",
        ],
      }),
      createApprovalForm: build.mutation({
        query: (body) => ({
          url: "forms",
          method: "POST",
          body,
        }),
        invalidatesTags: ["approvalForms"],
      }),
      updateApprovalForm: build.mutation({
        query: (body) => ({
          url: `forms/${body?.id}`,
          method: "PATCH",
          body: body?.data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "approvalForms", id },
          "approvalForms",
        ],
      }),
      deleteApprovalForm: build.mutation({
        query: (formId) => ({
          url: `forms/${formId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, formId) => [
          { type: "approvalForms", id: formId },
          "approvalForms",
        ],
      }),
    }),
  });

export const {
  useGetApprovalFormsQuery,
  useGetAllApprovalFormsQuery, // This will now work
  useGetSingleApprovalFormQuery,
  useLazyGetSingleApprovalFormQuery,
  useLazyGetAllApprovalFormsQuery,
  useCreateApprovalFormMutation,
  useUpdateApprovalFormMutation,
  useDeleteApprovalFormMutation,
  useGetAllEmployeesQuery, // Also export this since it's used in your component
  useLazyGetAllEmployeesQuery,
} = approvalForm;

export default approvalForm;
