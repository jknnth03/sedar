import { sedarApi } from "..";

const mainApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["employees", "positions"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getEmployees: build.query({
        query: (params = {}) => {
          const {
            pagination = 1,
            page = 1,
            per_page = 10,
            status = "all",
            employment_status = "ACTIVE",
            search,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          if (pagination) queryParams.append("pagination", pagination);
          if (page) queryParams.append("page", page);
          if (per_page) queryParams.append("per_page", per_page);
          if (status) queryParams.append("status", status);
          if (employment_status)
            queryParams.append("employment_status", employment_status);
          if (search) queryParams.append("search", search);

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, value);
            }
          });

          const queryString = queryParams.toString();
          const url = queryString ? `employees?${queryString}` : "employees";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: (result) =>
          result?.data
            ? [
                { type: "employees", id: "LIST" },
                ...result.data.map((emp) => ({
                  type: "employees",
                  id: emp.id,
                })),
              ]
            : [{ type: "employees", id: "LIST" }],
      }),

      getAllEmployees: build.query({
        query: (params = {}) => {
          const {
            pagination = "none",
            page = 1,
            status = "all",
            employment_status = "ACTIVE",
            search,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          if (pagination) queryParams.append("pagination", pagination);
          if (page) queryParams.append("page", page);
          if (status) queryParams.append("status", status);
          if (employment_status)
            queryParams.append("employment_status", employment_status);
          if (search) queryParams.append("search", search);

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, value);
            }
          });

          const queryString = queryParams.toString();
          const url = queryString ? `employees?${queryString}` : "employees";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: [{ type: "employees", id: "ALL_LIST" }],
      }),

      getGeneralInfo: build.query({
        query: (params = {}) => {
          const {
            pagination = "none",
            status = "all",
            employment_status = "ACTIVE",
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination);
          queryParams.append("status", status);
          queryParams.append("employment_status", employment_status);

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, value);
            }
          });

          const queryString = queryParams.toString();

          return {
            url: `employees/general-info?${queryString}`,
            method: "GET",
          };
        },
        providesTags: [{ type: "employees", id: "GENERAL_INFO" }],
      }),

      getReferredByOptions: build.query({
        query: () => {
          const queryParams = new URLSearchParams();
          queryParams.append("pagination", "none");
          queryParams.append("status", "all");
          queryParams.append("employment_status", "ACTIVE");

          return {
            url: `employees/general-info?${queryParams.toString()}`,
            method: "GET",
          };
        },
        transformResponse: (response) => {
          if (Array.isArray(response)) {
            return response.map((emp) => ({
              value: emp.id,
              label: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
              employee_number: emp.employee_number,
              ...emp,
            }));
          }
          if (response?.data && Array.isArray(response.data)) {
            return response.data.map((emp) => ({
              value: emp.id,
              label: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
              employee_number: emp.employee_number,
              ...emp,
            }));
          }
          return [];
        },
        providesTags: [{ type: "employees", id: "REFERRED_BY_OPTIONS" }],
      }),

      getSingleEmployee: build.query({
        query: (employeeId) => ({
          url: `employees/${employeeId}`,
          method: "GET",
        }),
        providesTags: (result, error, employeeId) => [
          { type: "employees", id: employeeId },
        ],
      }),

      getAllPositions: build.query({
        query: () => ({
          url: `positions/manpower-options`,
          method: "GET",
        }),
        providesTags: ["positions"],
      }),

      getAllApprovedMrf: build.query({
        query: () => ({
          url: `mrf/approved`,
          method: "GET",
        }),
        providesTags: ["employees"],
      }),

      getAllEmployeesToBeReplaced: build.query({
        query: ({ position_id, requisition_type_id, current_mrf_id }) => {
          const queryParams = new URLSearchParams();

          if (position_id) queryParams.append("position_id", position_id);
          if (requisition_type_id)
            queryParams.append("requisition_type_id", requisition_type_id);
          if (current_mrf_id)
            queryParams.append("current_mrf_id", current_mrf_id);

          const queryString = queryParams.toString();

          return {
            url: `employees/replacement-options?${queryString}`,
            method: "GET",
          };
        },
        providesTags: [{ type: "employees", id: "REPLACEMENT_OPTIONS" }],
      }),

      getEmployeeRegistrationCounts: build.query({
        query: () => ({
          url: "me/employee-registrations/counts",
          method: "GET",
        }),
        providesTags: [{ type: "employees", id: "REGISTRATION_COUNTS" }],
      }),

      createEmployee: build.mutation({
        query: (body) => {
          const hasFiles =
            body.files &&
            body.files.some((file) => file.file_attachment instanceof File);

          if (hasFiles) {
            const formData = new FormData();

            Object.keys(body).forEach((key) => {
              if (
                key !== "files" &&
                body[key] !== undefined &&
                body[key] !== null
              ) {
                if (typeof body[key] === "object" && body[key] !== null) {
                  formData.append(key, JSON.stringify(body[key]));
                } else {
                  formData.append(key, body[key]);
                }
              }
            });

            if (body.files && Array.isArray(body.files)) {
              body.files.forEach((file, index) => {
                Object.keys(file).forEach((fileKey) => {
                  if (
                    fileKey === "file_attachment" &&
                    file[fileKey] instanceof File
                  ) {
                    formData.append(
                      `files[${index}][${fileKey}]`,
                      file[fileKey]
                    );
                  } else if (
                    file[fileKey] !== undefined &&
                    file[fileKey] !== null
                  ) {
                    formData.append(
                      `files[${index}][${fileKey}]`,
                      file[fileKey]
                    );
                  }
                });
              });
            }

            return {
              url: "employees",
              method: "POST",
              body: formData,
            };
          } else {
            return {
              url: "employees",
              method: "POST",
              body,
            };
          }
        },
        invalidatesTags: [
          { type: "employees", id: "LIST" },
          { type: "employees", id: "ALL_LIST" },
          { type: "employees", id: "GENERAL_INFO" },
          { type: "employees", id: "REGISTRATION_COUNTS" },
        ],
      }),

      updateEmployee: build.mutation({
        query: (body) => ({
          url: `employees/${body?.id}`,
          method: "POST",
          body: body?.data,
        }),
        invalidatesTags: (result, error, body) => [
          { type: "employees", id: body?.id },
          { type: "employees", id: "LIST" },
          { type: "employees", id: "ALL_LIST" },
          { type: "employees", id: "GENERAL_INFO" },
        ],
      }),

      deleteEmployee: build.mutation({
        query: (employeeId) => ({
          url: `employees/${employeeId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, employeeId) => [
          { type: "employees", id: employeeId },
          { type: "employees", id: "LIST" },
          { type: "employees", id: "ALL_LIST" },
          { type: "employees", id: "GENERAL_INFO" },
          { type: "employees", id: "REGISTRATION_COUNTS" },
        ],
      }),
    }),
  });

export const {
  useGetEmployeesQuery,
  useLazyGetEmployeesQuery,
  useGetAllEmployeesQuery,
  useLazyGetAllEmployeesQuery,
  useGetGeneralInfoQuery,
  useLazyGetGeneralInfoQuery,
  useGetReferredByOptionsQuery,
  useLazyGetReferredByOptionsQuery,
  useGetSingleEmployeeQuery,
  useLazyGetSingleEmployeeQuery,
  useGetAllPositionsQuery,
  useGetAllApprovedMrfQuery,
  useLazyGetAllApprovedMrfQuery,
  useGetAllEmployeesToBeReplacedQuery,
  useLazyGetAllEmployeesToBeReplacedQuery,
  useGetEmployeeRegistrationCountsQuery,
  useLazyGetEmployeeRegistrationCountsQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = mainApi;

export default mainApi;
