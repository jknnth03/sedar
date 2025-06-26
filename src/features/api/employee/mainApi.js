import { sedarApi } from "..";

const mainApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["employees"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // GET - Fetch Employees with pagination and filtering
      getEmployees: build.query({
        query: (params = {}) => {
          const {
            id,
            pagination = 1,
            page = 1,
            per_page = 10,
            status,
            search,
            ...otherParams
          } = params;

          // Build query string from parameters
          const queryParams = new URLSearchParams();

          if (pagination) queryParams.append("pagination", pagination);
          if (page) queryParams.append("page", page);
          if (per_page) queryParams.append("per_page", per_page);
          if (status) queryParams.append("status", status);
          if (search) queryParams.append("search", search);

          // Add any other parameters
          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, value);
            }
          });

          const queryString = queryParams.toString();
          const baseUrl = id ? `employees/${id}` : "employees";
          const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

          console.log(`📊 Fetching employees from: ${url}`);

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["employees"],
      }),

      // POST - Create Employee (supports both JSON and FormData)
      createEmployee: build.mutation({
        query: (body) => {
          // Debug logging to track file uploads
          console.log("🚀 Creating employee with data:", {
            isFormData: body instanceof FormData,
            bodyType: typeof body,
          });

          if (body instanceof FormData) {
            console.log("📋 FormData entries being sent:");
            let fileCount = 0;
            for (let [key, value] of body.entries()) {
              if (value instanceof File) {
                console.log(
                  `  ${key}: File(${value.name}, ${value.size} bytes)`
                );
                fileCount++;
              } else {
                console.log(`  ${key}: ${value}`);
              }
            }
            console.log(`✅ Total files in request: ${fileCount}`);
          }

          return {
            url: "employees",
            method: "POST",
            body,
          };
        },
        invalidatesTags: ["employees"],
      }),

      updateEmployee: build.mutation({
        query: ({ id, ...rest }) => {
          // Extract the body from the rest of the parameters
          const body = rest.data || rest;

          // Debug logging to track file uploads
          console.log(`🔄 Updating employee ${id} with data:`, {
            isFormData: body instanceof FormData,
            bodyType: typeof body,
            actualBody: body,
          });

          if (body instanceof FormData) {
            console.log("📋 FormData entries being sent:");
            let fileCount = 0;
            for (let [key, value] of body.entries()) {
              if (value instanceof File) {
                console.log(
                  `  ${key}: File(${value.name}, ${value.size} bytes)`
                );
                fileCount++;
              } else {
                console.log(`  ${key}: ${value}`);
              }
            }
            console.log(`✅ Total files in request: ${fileCount}`);
          }

          return {
            url: `employees/${id}`,
            method: "PATCH",
            body,
          };
        },
        invalidatesTags: ["employees"],
      }),
    }),
  });

export const {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} = mainApi;
