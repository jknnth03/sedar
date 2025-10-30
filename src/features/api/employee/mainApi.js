import { sedarApi } from "..";

const mainApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["employees"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getEmployees: build.query({
        query: (params = {}) => {
          const {
            pagination = 1,
            page = 1,
            per_page = 10,
            status,
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
          const url = queryString ? `employees?${queryString}` : "employees";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["employees"],
      }),

      getAllEmployees: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            status = "active",
            search,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          if (pagination) queryParams.append("pagination", pagination);
          if (page) queryParams.append("page", page);
          if (status) queryParams.append("status", status);
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
        providesTags: ["employees"],
      }),

      getSingleEmployee: build.query({
        query: (employeeId) => ({
          url: `employees/${employeeId}`,
          method: "GET",
        }),
        providesTags: (result, error, employeeId) => [
          { type: "employees", id: employeeId },
          "employees",
        ],
      }),

      getAllPositions: build.query({
        query: () => ({
          url: `positions/manpower-options`,
          method: "GET",
        }),
        providesTags: ["employees"],
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
        providesTags: ["employees"],
      }),

      getEmployeeRegistrationCounts: build.query({
        query: () => ({
          url: "me/employee-registrations/counts",
          method: "GET",
        }),
        providesTags: ["employees"],
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
        invalidatesTags: ["employees"],
      }),

      updateEmployee: build.mutation({
        query: (body) => ({
          url: `employees/${body?.id}`,
          method: "POST",
          body: body?.data,
        }),
        invalidatesTags: (result, error, body) => [
          { type: "employees", id: body?.id },
          "employees",
        ],
      }),

      deleteEmployee: build.mutation({
        query: (employeeId) => ({
          url: `employees/${employeeId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, employeeId) => [
          { type: "employees", id: employeeId },
          "employees",
        ],
      }),
    }),
  });

export const {
  useGetEmployeesQuery,
  useLazyGetEmployeesQuery,
  useGetAllEmployeesQuery,
  useLazyGetAllEmployeesQuery,
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
