import { sedarApi } from "..";

const approvalForm = sedarApi
  .enhanceEndpoints({ addTagTypes: ["approvalForms"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getApprovalForms: build.query({
        query: (params = {}) => {
          console.log("getApprovalForms called with params:", params);

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
          const url = queryString ? `forms?${queryString}` : "forms";

          console.log("getApprovalForms Final URL:", url);

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["approvalForms"],
      }),

      getAllApprovalForms: build.query({
        query: (params = {}) => {
          console.log("getAllApprovalForms called with params:", params);

          const {
            pagination = "none",
            status = "active",
            search,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination);
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

          console.log("getAllApprovalForms Final URL:", url);

          return {
            url,
            method: "GET",
          };
        },
        transformResponse: (response) => {
          console.log("Raw API Response (getAllApprovalForms):", response);

          if (response && response.result) {
            if (response.result.data && Array.isArray(response.result.data)) {
              return { result: response.result.data };
            }
            if (Array.isArray(response.result)) {
              return { result: response.result };
            }
            return { result: response.result };
          }

          if (response && response.data) {
            return {
              result: Array.isArray(response.data) ? response.data : [],
            };
          }

          return { result: [] };
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

          if (pagination)
            queryParams.append("pagination", pagination.toString());
          if (page) queryParams.append("page", page.toString());
          if (per_page) queryParams.append("per_page", per_page.toString());
          if (status) queryParams.append("status", status);
          if (search) queryParams.append("search", search);

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });

          const queryString = queryParams.toString();
          const url = queryString ? `employees?${queryString}` : "employees";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["employees"],
      }),

      getSingleApprovalForm: build.query({
        query: (approvalFormId) => {
          console.log("getSingleApprovalForm called with ID:", approvalFormId);
          return {
            url: `forms/${approvalFormId}`,
            method: "GET",
          };
        },
        providesTags: (result, error, approvalFormId) => [
          { type: "approvalForms", id: approvalFormId },
          "approvalForms",
        ],
      }),

      createApprovalForm: build.mutation({
        query: (body) => {
          console.log("createApprovalForm called with body:", body);
          return {
            url: "forms",
            method: "POST",
            body,
          };
        },
        invalidatesTags: ["approvalForms"],
      }),

      updateApprovalForm: build.mutation({
        query: (body) => {
          console.log("updateApprovalForm called with body:", body);
          return {
            url: `forms/${body?.id}`,
            method: "PATCH",
            body: body?.data,
          };
        },
        invalidatesTags: (result, error, { id }) => [
          { type: "approvalForms", id },
          "approvalForms",
        ],
      }),

      deleteApprovalForm: build.mutation({
        query: (formId) => {
          console.log("deleteApprovalForm called with ID:", formId);
          return {
            url: `forms/${formId}`,
            method: "DELETE",
          };
        },
        invalidatesTags: (result, error, formId) => [
          { type: "approvalForms", id: formId },
          "approvalForms",
        ],
      }),
    }),
  });

export const {
  useGetApprovalFormsQuery,
  useGetAllApprovalFormsQuery,
  useGetSingleApprovalFormQuery,
  useLazyGetSingleApprovalFormQuery,
  useLazyGetAllApprovalFormsQuery,
  useCreateApprovalFormMutation,
  useUpdateApprovalFormMutation,
  useDeleteApprovalFormMutation,
  useGetAllEmployeesQuery,
  useLazyGetAllEmployeesQuery,
} = approvalForm;

export default approvalForm;
